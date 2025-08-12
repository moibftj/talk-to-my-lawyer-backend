import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import OpenAI from 'openai'
import { Resend } from 'resend'
import Stripe from 'stripe'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to generate random coupon code
function generateCouponCode() {
  return Math.random().toString(36).substr(2, 9).toUpperCase()
}

// Helper function to log webhook events
async function logWebhookEvent(db, event, status, error = null) {
  try {
    await db.collection('webhook_logs').insertOne({
      id: uuidv4(),
      event_id: event.id,
      event_type: event.type,
      status: status,
      error: error,
      event_data: event.data,
      timestamp: new Date(),
      created_at: new Date()
    })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Talk To My Lawyer API is running!",
        timestamp: new Date().toISOString(),
        version: "2.0.0"
      }))
    }

    // Health check endpoint
    if (route === '/health' && method === 'GET') {
      try {
        // Test database connection
        await db.admin().ping()
        return handleCORS(NextResponse.json({ 
          status: "healthy",
          database: "connected",
          timestamp: new Date().toISOString()
        }))
      } catch (error) {
        return handleCORS(NextResponse.json({ 
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString()
        }, { status: 503 }))
      }
    }

    // AUTH ROUTES
    // Register - POST /api/auth/register
    if (route === '/auth/register' && method === 'POST') {
      const { email, password, name, role = 'user' } = await request.json()
      
      // Validation
      if (!email || !password || !name) {
        return handleCORS(NextResponse.json({ error: 'All fields are required' }, { status: 400 }))
      }

      if (password.length < 6) {
        return handleCORS(NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 }))
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existingUser) {
        return handleCORS(NextResponse.json({ error: 'User already exists with this email' }, { status: 400 }))
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      
      // Create user
      const user = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role,
        subscription: {
          status: 'free',
          planId: null,
          packageType: null,
          lettersRemaining: 0,
          currentPeriodEnd: null
        },
        stripeCustomerId: null,
        isActive: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('users').insertOne(user)

      // Create role-specific profile
      if (role === 'contractor') {
        // Create contractor profile with username as referral code
        const universalCode = generateCouponCode()
        
        await db.collection('contractors').insertOne({
          id: uuidv4(),
          user_id: user.id,
          points: 0,
          total_signups: 0,
          username: user.name.toLowerCase().replace(/\s+/g, '').substring(0, 5), // 5 chars max
          created_at: new Date()
        })
      } else if (role === 'admin') {
        await db.collection('admins').insertOne({
          id: uuidv4(),
          user_id: user.id,
          permissions: ['manage_users', 'manage_contractors', 'manage_letters'],
          created_at: new Date()
        })
      }

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return handleCORS(NextResponse.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          subscription: user.subscription 
        },
        token,
        message: 'Registration successful with 20% discount applied!'
      }))
    }

    // Register with coupon - POST /api/auth/register-with-coupon
    if (route === '/auth/register-with-coupon' && method === 'POST') {
      const { email, password, name, role = 'user', coupon_code } = await request.json()
      
      if (!email || !password || !name) {
        return handleCORS(NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 }))
      }
      
      if (!coupon_code) {
        return handleCORS(NextResponse.json({ error: 'Coupon code is required' }, { status: 400 }))
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ 
        email: email.toLowerCase() 
      })
      
      if (existingUser) {
        return handleCORS(NextResponse.json({ error: 'User already exists' }, { status: 400 }))
      }

      // Validate coupon code (Remote Employee username)
      const contractor = await db.collection('contractors').findOne({ username: coupon_code })
      if (!contractor) {
        return handleCORS(NextResponse.json({ error: 'Invalid referral code' }, { status: 400 }))
      }

      // Create user with 20% discount
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        subscription: { 
          status: 'free',
          discount_percent: 20,
          referred_by: contractor.user_id
        },
        isActive: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('users').insertOne(user)

      // Update contractor stats
      await db.collection('contractors').updateOne(
        { id: contractor.id },
        { 
          $inc: { 
            points: 1,
            total_signups: 1
          },
          $set: { updated_at: new Date() }
        }
      )

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return handleCORS(NextResponse.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          subscription: user.subscription 
        },
        token,
        message: 'Registration successful with 20% discount applied!'
      }))
    }

    // Validate coupon - POST /api/coupons/validate
    if (route === '/coupons/validate' && method === 'POST') {
      const { coupon_code } = await request.json()
      
      if (!coupon_code) {
        return handleCORS(NextResponse.json({ error: 'Referral code is required' }, { status: 400 }))
      }

      const contractor = await db.collection('contractors').findOne({ username: coupon_code })
      if (!contractor) {
        return handleCORS(NextResponse.json({ 
          valid: false, 
          error: 'Invalid referral code' 
        }, { status: 400 }))
      }

      return handleCORS(NextResponse.json({ 
        valid: true,
        discount_percent: 20,
        message: 'Valid referral code - 20% discount will be applied'
      }))
    }

    // Login - POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      
      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email and password are required' }, { status: 400 }))
      }
      
      const user = await db.collection('users').findOne({ 
        email: email.toLowerCase(),
        isActive: true
      })
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return handleCORS(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
      }

      // Update last login
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { lastLogin: new Date(), updated_at: new Date() } }
      )

      const token = jwt.sign({ 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '7d' })
      
      return handleCORS(NextResponse.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          subscription: user.subscription || { status: 'free' }
        },
        token,
        message: 'Login successful!'
      }))
    }

    // Get current user - GET /api/auth/me
    if (route === '/auth/me' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'No authorization token provided' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }))
      }

      const user = await db.collection('users').findOne({ 
        id: decoded.userId,
        isActive: true
      })
      
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found or deactivated' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role, 
          subscription: user.subscription || { status: 'free' }
        }
      }))
    }

    // STRIPE SUBSCRIPTION ROUTES
    // Create subscription checkout session - POST /api/subscription/create-checkout
    if (route === '/subscription/create-checkout' && method === 'POST') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 }))
      }

      const { packageType } = await request.json()
      
      if (!packageType || !['4letters', '6letters', '8letters'].includes(packageType)) {
        return handleCORS(NextResponse.json({ error: 'Invalid package type' }, { status: 400 }))
      }
      
      const user = await db.collection('users').findOne({ id: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      try {
        // Create or get Stripe customer
        let stripeCustomerId = user.stripeCustomerId
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user.id
            }
          })
          stripeCustomerId = customer.id
          await db.collection('users').updateOne(
            { id: decoded.userId },
            { $set: { stripeCustomerId, updated_at: new Date() } }
          )
        }

        const packageDetails = {
          '4letters': { amount: 19999, name: '4 Letters Package' },
          '6letters': { amount: 49999, name: '6 Letters Package' },
          '8letters': { amount: 99999, name: '8 Letters Package' }
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: packageDetails[packageType].name,
                description: `Professional legal letters - ${packageType.replace('letters', ' letters')}`,
                metadata: {
                  packageType: packageType
                }
              },
              unit_amount: packageDetails[packageType].amount
            },
            quantity: 1
          }],
          customer: stripeCustomerId,
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}?session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?canceled=true`,
          metadata: {
            userId: decoded.userId,
            packageType: packageType
          },
          payment_intent_data: {
            metadata: {
              userId: decoded.userId,
              packageType: packageType
            }
          }
        })

        // Log the checkout session creation
        await db.collection('payment_sessions').insertOne({
          id: uuidv4(),
          user_id: decoded.userId,
          stripe_session_id: session.id,
          package_type: packageType,
          amount: packageDetails[packageType].amount,
          status: 'created',
          created_at: new Date()
        })

        return handleCORS(NextResponse.json({ 
          sessionId: session.id,
          url: session.url
        }))
      } catch (error) {
        console.error('Stripe Checkout Error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to create checkout session. Please try again.' 
        }, { status: 500 }))
      }
    }

    // Stripe webhook - POST /api/webhooks/stripe
    if (route === '/webhooks/stripe' && method === 'POST') {
      const body = await request.text()
      const sig = request.headers.get('stripe-signature')
      
      if (!sig) {
        console.error('Missing stripe-signature header')
        return handleCORS(NextResponse.json({ error: 'Missing signature' }, { status: 400 }))
      }

      let event
      try {
        // Verify webhook signature if webhook secret is available
        if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_placeholder') {
          event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
        } else {
          // For development, parse the event without verification
          event = JSON.parse(body)
          console.warn('Webhook signature verification skipped - using development mode')
        }
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        await logWebhookEvent(db, { id: 'unknown', type: 'signature_verification_failed' }, 'failed', err.message)
        return handleCORS(NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 }))
      }

      console.log(`Received webhook event: ${event.type}`)

      try {
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object
            const { userId, packageType } = session.metadata
            
            if (!userId || !packageType) {
              throw new Error('Missing metadata in checkout session')
            }
            
            // Update user subscription
            let lettersCount = packageType === '4letters' ? 4 : 
                             packageType === '6letters' ? 6 : 8
            
            const updateResult = await db.collection('users').updateOne(
              { id: userId },
              { 
                $set: {
                  'subscription.status': 'paid',
                  'subscription.planId': session.payment_intent,
                  'subscription.packageType': packageType,
                  'subscription.lettersRemaining': lettersCount,
                  'subscription.currentPeriodEnd': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                  updated_at: new Date()
                }
              }
            )

            if (updateResult.matchedCount === 0) {
              throw new Error(`User not found: ${userId}`)
            }

            // Update payment session status
            await db.collection('payment_sessions').updateOne(
              { stripe_session_id: session.id },
              { 
                $set: { 
                  status: 'completed',
                  completed_at: new Date(),
                  updated_at: new Date()
                }
              }
            )

            await logWebhookEvent(db, event, 'success')
            console.log(`Successfully processed payment for user ${userId}`)
            break

          case 'payment_intent.payment_failed':
            const paymentIntent = event.data.object
            const failedUserId = paymentIntent.metadata?.userId
            
            if (failedUserId) {
              await db.collection('payment_sessions').updateOne(
                { user_id: failedUserId },
                { 
                  $set: { 
                    status: 'failed',
                    failed_at: new Date(),
                    updated_at: new Date()
                  }
                }
              )
            }

            await logWebhookEvent(db, event, 'processed')
            console.log(`Payment failed for user ${failedUserId}`)
            break

          default:
            await logWebhookEvent(db, event, 'unhandled')
            console.log(`Unhandled event type: ${event.type}`)
        }

        return handleCORS(NextResponse.json({ 
          received: true,
          event_type: event.type,
          timestamp: new Date().toISOString()
        }))
      } catch (error) {
        console.error('Webhook processing error:', error)
        await logWebhookEvent(db, event, 'error', error.message)
        return handleCORS(NextResponse.json({ 
          error: 'Webhook processing failed',
          event_type: event.type 
        }, { status: 500 }))
      }
    }

    // Get webhook logs (admin only) - GET /api/webhooks/logs
    if (route === '/webhooks/logs' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Admin access required' }, { status: 403 }))
      }

      const logs = await db.collection('webhook_logs')
        .find({})
        .sort({ created_at: -1 })
        .limit(100)
        .toArray()

      const cleanedLogs = logs.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ logs: cleanedLogs }))
    }

    // DOCUMENT GENERATION ROUTES
    // Get document types - GET /api/documents/types
    if (route === '/documents/types' && method === 'GET') {
      const documentTypes = {
        categories: [
          {
            id: 'business_letters',
            name: 'Business Letters',
            description: 'Professional business correspondence and conflict resolution',
            icon: '💼',
            types: [
              { id: 'demand_letter', name: 'Demand Letter', description: 'Formal demands for payment or action' },
              { id: 'cease_desist', name: 'Cease & Desist', description: 'Stop unwanted behavior or infringement' },
              { id: 'complaint_letter', name: 'Complaint Letter', description: 'Formal complaints about services or products' },
              { id: 'collection_notice', name: 'Collection Notice', description: 'Debt collection and payment demands' },
              { id: 'breach_notice', name: 'Breach Notice', description: 'Contract breach notifications' },
              { id: 'settlement_discussion', name: 'Settlement Discussion', description: 'Professional letters to initiate settlement negotiations and resolution' }
            ]
          },
          {
            id: 'contracts',
            name: 'Contracts & Agreements',
            description: 'Legal agreements and contract documents',
            icon: '📄',
            types: [
              { id: 'service_agreement', name: 'Service Agreement', description: 'Service provider contracts' },
              { id: 'nda', name: 'Non-Disclosure Agreement', description: 'Confidentiality agreements' },
              { id: 'partnership_agreement', name: 'Partnership Agreement', description: 'Business partnership contracts' },
              { id: 'consulting_agreement', name: 'Consulting Agreement', description: 'Consultant service contracts' },
              { id: 'freelance_contract', name: 'Freelance Contract', description: 'Independent contractor agreements' }
            ]
          },
          {
            id: 'employment',
            name: 'Employment Documents',
            description: 'Workplace and employment-related documents',
            icon: '👥',
            types: [
              { id: 'employment_contract', name: 'Employment Contract', description: 'Employee hire agreements' },
              { id: 'termination_letter', name: 'Termination Letter', description: 'Employee termination notices' },
              { id: 'resignation_letter', name: 'Resignation Letter', description: 'Employee resignation notices' },
              { id: 'disciplinary_notice', name: 'Disciplinary Notice', description: 'Employee discipline documentation' },
              { id: 'reference_letter', name: 'Reference Letter', description: 'Employee reference letters' }
            ]
          },
          {
            id: 'real_estate',
            name: 'Real Estate Documents',
            description: 'Property and real estate legal documents',
            icon: '🏠',
            types: [
              { id: 'lease_agreement', name: 'Lease Agreement', description: 'Rental property contracts' },
              { id: 'eviction_notice', name: 'Eviction Notice', description: 'Tenant eviction notifications' },
              { id: 'purchase_agreement', name: 'Purchase Agreement', description: 'Property purchase contracts' },
              { id: 'property_disclosure', name: 'Property Disclosure', description: 'Property condition disclosures' },
              { id: 'rent_increase_notice', name: 'Rent Increase Notice', description: 'Rent adjustment notifications' }
            ]
          },
          {
            id: 'business_formation',
            name: 'Business Formation',
            description: 'Business setup and corporate documents',
            icon: '🏢',
            types: [
              { id: 'llc_operating_agreement', name: 'LLC Operating Agreement', description: 'LLC governance documents' },
              { id: 'articles_incorporation', name: 'Articles of Incorporation', description: 'Corporate formation documents' },
              { id: 'bylaws', name: 'Corporate Bylaws', description: 'Corporate governance rules' },
              { id: 'business_plan', name: 'Business Plan', description: 'Formal business planning documents' },
              { id: 'partnership_dissolution', name: 'Partnership Dissolution', description: 'Partnership termination documents' }
            ]
          },
          {
            id: 'legal_notices',
            name: 'Legal Notices',
            description: 'Official legal notifications and notices',
            icon: '⚖️',
            types: [
              { id: 'copyright_notice', name: 'Copyright Notice', description: 'Copyright protection notifications' },
              { id: 'trademark_notice', name: 'Trademark Notice', description: 'Trademark protection notices' },
              { id: 'privacy_policy', name: 'Privacy Policy', description: 'Data privacy compliance documents' },
              { id: 'terms_of_service', name: 'Terms of Service', description: 'Service usage agreements' },
              { id: 'liability_waiver', name: 'Liability Waiver', description: 'Risk assumption documents' }
            ]
          },
          {
            id: 'personal_legal',
            name: 'Personal Legal Documents',
            description: 'Individual legal documents and personal matters',
            icon: '👤',
            types: [
              { id: 'will', name: 'Last Will & Testament', description: 'Estate planning documents' },
              { id: 'power_of_attorney', name: 'Power of Attorney', description: 'Legal authority delegation' },
              { id: 'living_will', name: 'Living Will', description: 'Medical care directives' },
              { id: 'name_change_petition', name: 'Name Change Petition', description: 'Legal name change documents' },
              { id: 'divorce_agreement', name: 'Divorce Agreement', description: 'Divorce settlement documents' }
            ]
          }
        ]
      }

      return handleCORS(NextResponse.json(documentTypes))
    }

    // Generate document - POST /api/documents/generate
    if (route === '/documents/generate' && method === 'POST') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 }))
      }

      const { title, documentType, category, formData = {}, urgencyLevel = 'standard' } = await request.json()

      // Check if user has letters remaining
      const user = await db.collection('users').findOne({ id: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      if (user.subscription?.status !== 'paid' || user.subscription?.lettersRemaining <= 0) {
        return handleCORS(NextResponse.json({ 
          error: 'No documents remaining. Please subscribe to continue.',
          subscription_required: true
        }, { status: 403 }))
      }

      // Get document-specific system prompt
      const systemPrompt = getDocumentSystemPrompt(documentType, category)

      // Enhanced user prompt with structured information
      const enhancedPrompt = buildDocumentPrompt(documentType, category, formData, urgencyLevel)

      try {
        // Generate document with OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        });

        const generatedContent = completion.choices[0].message.content;

        // Save document to database
        const document = {
          id: uuidv4(),
          user_id: decoded.userId,
          title,
          content: generatedContent,
          document_type: documentType,
          category: category,
          form_data: formData,
          urgency_level: urgencyLevel,
          status: 'ready',
          stage: 4, // Ready to send
          professional_generated: true,
          created_at: new Date(),
          updated_at: new Date()
        }

        await db.collection('documents').insertOne(document)

        // Decrease letters remaining
        await db.collection('users').updateOne(
          { id: decoded.userId },
          { 
            $inc: { 'subscription.lettersRemaining': -1 },
            $set: { updated_at: new Date() }
          }
        )

        return handleCORS(NextResponse.json({ 
          document: { ...document, _id: undefined },
          letters_remaining: user.subscription.lettersRemaining - 1
        }))
      } catch (error) {
        console.error('OpenAI API Error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to generate document. Please try again.',
          ai_service_error: true
        }, { status: 500 }))
      }
    }

    // LEGACY LETTER ROUTES (for backward compatibility)
    // Generate letter - POST /api/letters/generate
    if (route === '/letters/generate' && method === 'POST') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 }))
      }

      const { title, prompt, letterType = 'general', formData = {}, urgencyLevel = 'standard' } = await request.json()

      // Check if user has letters remaining
      const user = await db.collection('users').findOne({ id: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      if (user.subscription?.status !== 'paid' || user.subscription?.lettersRemaining <= 0) {
        return handleCORS(NextResponse.json({ 
          error: 'No letters remaining. Please subscribe to continue.',
          subscription_required: true
        }, { status: 403 }))
      }

      // Enhanced system prompt for professional letter generation
      const systemPrompt = `You are a professional legal letter writer and paralegal assistant working for Talk To My Lawyer. Generate formal, professional, and legally appropriate letters based on the provided information. 
      
      Guidelines:
      - Use formal business letter format with proper headers and structure
      - Include sender and recipient information when provided
      - Be direct, professional, and clear in communication
      - Use appropriate legal language where applicable
      - Include relevant dates and specific details
      - Ensure the letter achieves the stated objective
      - Maintain a professional but firm tone when appropriate
      - Sign letters as coming from Talk To My Lawyer legal team`

      // Enhanced user prompt with structured information
      const enhancedPrompt = `
      Generate a professional ${letterType} letter with the following details:

      ${prompt}

      ${formData.fullName ? `Sender: ${formData.fullName}` : ''}
      ${formData.yourAddress ? `Sender Address: ${formData.yourAddress}` : ''}
      ${formData.recipientName ? `Recipient: ${formData.recipientName}` : ''}
      ${formData.recipientAddress ? `Recipient Address: ${formData.recipientAddress}` : ''}
      ${formData.briefDescription ? `Situation: ${formData.briefDescription}` : ''}
      ${formData.detailedInformation ? `Details: ${formData.detailedInformation}` : ''}
      ${formData.whatToAchieve ? `Desired Outcome: ${formData.whatToAchieve}` : ''}
      ${urgencyLevel !== 'standard' ? `Urgency: ${urgencyLevel}` : ''}

      Please format this as a complete, professional letter ready to send.
      `

      try {
        // Generate letter with OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        });

        const generatedContent = completion.choices[0].message.content;

        // Save letter to database
        const letter = {
          id: uuidv4(),
          user_id: decoded.userId,
          title,
          content: generatedContent,
          letter_type: letterType,
          form_data: formData,
          urgency_level: urgencyLevel,
          status: 'ready',
          stage: 4, // Ready to send
          professional_generated: true,
          created_at: new Date(),
          updated_at: new Date()
        }

        await db.collection('letters').insertOne(letter)

        // Decrease letters remaining
        await db.collection('users').updateOne(
          { id: decoded.userId },
          { 
            $inc: { 'subscription.lettersRemaining': -1 },
            $set: { updated_at: new Date() }
          }
        )

        return handleCORS(NextResponse.json({ 
          letter: { ...letter, _id: undefined },
          letters_remaining: user.subscription.lettersRemaining - 1
        }))
      } catch (error) {
        console.error('OpenAI API Error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to generate letter. Please try again.',
          ai_service_error: true
        }, { status: 500 }))
      }
    }

    // Submit letter request - POST /api/letters/submit
    if (route === '/letters/submit' && method === 'POST') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 }))
      }

      const { title, letterType = 'general', formData = {}, urgencyLevel = 'standard' } = await request.json()

      // Check if user has subscription
      const user = await db.collection('users').findOne({ id: decoded.userId })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      if (user.subscription?.status !== 'paid' || user.subscription?.lettersRemaining <= 0) {
        return handleCORS(NextResponse.json({ 
          error: 'No letters remaining. Please subscribe to continue.',
          subscription_required: true
        }, { status: 403 }))
      }

      // Create letter request
      const letter = {
        id: uuidv4(),
        user_id: decoded.userId,
        title,
        content: '',
        letter_type: letterType,
        form_data: formData,
        urgency_level: urgencyLevel,
        status: 'submitted',
        stage: 1, // Letter Submitted
        professional_generated: false,
        created_at: new Date(),
        updated_at: new Date()
      }

      await db.collection('letters').insertOne(letter)

      return handleCORS(NextResponse.json({ 
        letter: { ...letter, _id: undefined }
      }))
    }

    // Update letter stage - PUT /api/letters/{id}/stage
    if (route.startsWith('/letters/') && route.endsWith('/stage') && method === 'PUT') {
      const letterId = route.split('/')[2]
      const { stage } = await request.json()
      
      if (!stage || stage < 1 || stage > 4) {
        return handleCORS(NextResponse.json({ error: 'Invalid stage number' }, { status: 400 }))
      }
      
      const result = await db.collection('letters').updateOne(
        { id: letterId },
        { 
          $set: { 
            stage: stage,
            updated_at: new Date()
          }
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json({ error: 'Letter not found' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({ success: true, stage }))
    }

    // Get letter by ID - GET /api/letters/{id}
    if (route.startsWith('/letters/') && !route.includes('/stage') && !route.includes('/send') && method === 'GET') {
      const letterId = route.split('/')[2]
      
      const letter = await db.collection('letters').findOne({ id: letterId })
      if (!letter) {
        return handleCORS(NextResponse.json({ error: 'Letter not found' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({ letter: { ...letter, _id: undefined } }))
    }

    // Get user letters - GET /api/letters
    if (route === '/letters' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded) {
        return handleCORS(NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 }))
      }

      const letters = await db.collection('letters')
        .find({ user_id: decoded.userId })
        .sort({ created_at: -1 })
        .toArray()

      const cleanedLetters = letters.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ letters: cleanedLetters }))
    }

    // Send letter via email - POST /api/letters/{id}/send
    if (route.startsWith('/letters/') && route.endsWith('/send') && method === 'POST') {
      const letterId = route.split('/')[2]
      const { recipientEmail } = await request.json()
      
      if (!recipientEmail || !/\S+@\S+\.\S+/.test(recipientEmail)) {
        return handleCORS(NextResponse.json({ error: 'Valid recipient email is required' }, { status: 400 }))
      }
      
      const letter = await db.collection('letters').findOne({ id: letterId })
      if (!letter) {
        return handleCORS(NextResponse.json({ error: 'Letter not found' }, { status: 404 }))
      }

      try {
        await resend.emails.send({
          from: 'Talk To My Lawyer <noreply@talktomylawyer.com>',
          to: recipientEmail,
          subject: `Legal Letter: ${letter.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Professional Legal Letter</h2>
              <p style="color: #666; margin: 20px 0;">Please find the attached legal letter below:</p>
              <div style="border: 1px solid #ccc; padding: 30px; margin: 20px 0; background: #f9f9f9; border-radius: 8px;">
                <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif; line-height: 1.6; margin: 0;">${letter.content}</pre>
              </div>
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; color: #666; font-size: 12px;">
                <p><strong>This letter was professionally generated by Talk To My Lawyer.</strong></p>
                <p>For questions or additional legal services, please visit our website or contact our support team.</p>
              </div>
            </div>
          `
        })

        // Log the email send
        await db.collection('email_logs').insertOne({
          id: uuidv4(),
          letter_id: letterId,
          recipient_email: recipientEmail,
          sent_at: new Date(),
          status: 'sent'
        })

        return handleCORS(NextResponse.json({ 
          success: true,
          message: 'Letter sent successfully'
        }))
      } catch (error) {
        console.error('Email sending error:', error)
        
        // Log the email error
        await db.collection('email_logs').insertOne({
          id: uuidv4(),
          letter_id: letterId,
          recipient_email: recipientEmail,
          sent_at: new Date(),
          status: 'failed',
          error: error.message
        })

        return handleCORS(NextResponse.json({ 
          error: 'Failed to send email. Please try again.',
          email_service_error: true
        }, { status: 500 }))
      }
    }

    // COUPON ROUTES
    // Create coupon - POST /api/coupons/create
    if (route === '/coupons/create' && method === 'POST') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'contractor') {
        return handleCORS(NextResponse.json({ error: 'Contractor access required' }, { status: 403 }))
      }

      const { discount_percent, max_uses = 100, expires_in_days = 30 } = await request.json()

      if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
        return handleCORS(NextResponse.json({ error: 'Discount percent must be between 1 and 100' }, { status: 400 }))
      }

      const coupon = {
        id: uuidv4(),
        contractor_id: decoded.userId,
        code: generateCouponCode(),
        discount_percent,
        max_uses,
        current_uses: 0,
        created_at: new Date(),
        expires_at: new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      }

      await db.collection('coupons').insertOne(coupon)

      return handleCORS(NextResponse.json({ 
        coupon: { ...coupon, _id: undefined },
        message: 'Coupon created successfully'
      }))
    }

    // Get contractor coupons - GET /api/coupons
    if (route === '/coupons' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'contractor') {
        return handleCORS(NextResponse.json({ error: 'Contractor access required' }, { status: 403 }))
      }

      const coupons = await db.collection('coupons')
        .find({ contractor_id: decoded.userId })
        .sort({ created_at: -1 })
        .toArray()

      const cleanedCoupons = coupons.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ coupons: cleanedCoupons }))
    }

    // REMOTE EMPLOYEE ROUTES (formerly contractor routes)
    // Get Remote Employee stats - GET /api/remote-employee/stats
    if (route === '/remote-employee/stats' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'contractor') {
        return handleCORS(NextResponse.json({ error: 'Remote Employee access required' }, { status: 403 }))
      }

      const contractor = await db.collection('contractors').findOne({ user_id: decoded.userId })
      if (!contractor) {
        return handleCORS(NextResponse.json({ error: 'Remote Employee profile not found' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({
        points: contractor.points,
        total_signups: contractor.total_signups,
        username: contractor.username,
        discount_percent: 20
      }))
    }

    // CONTRACTOR ROUTES (kept for backward compatibility)
    // Get contractor stats - GET /api/contractor/stats
    if (route === '/contractor/stats' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'contractor') {
        return handleCORS(NextResponse.json({ error: 'Contractor access required' }, { status: 403 }))
      }

      const contractor = await db.collection('contractors').findOne({ user_id: decoded.userId })
      if (!contractor) {
        return handleCORS(NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 }))
      }

      const coupons = await db.collection('coupons')
        .find({ contractor_id: decoded.userId })
        .toArray()

      const totalCoupons = coupons.length
      const activeCoupons = coupons.filter(c => c.expires_at > new Date() && c.current_uses < c.max_uses).length

      return handleCORS(NextResponse.json({
        points: contractor.points,
        total_signups: contractor.total_signups,
        total_coupons: totalCoupons,
        active_coupons: activeCoupons
      }))
    }

    // ADMIN ROUTES
    // Get all users - GET /api/admin/users
    if (route === '/admin/users' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Admin access required' }, { status: 403 }))
      }

      const users = await db.collection('users')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      const cleanedUsers = users.map(({ _id, password, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ users: cleanedUsers }))
    }

    // Get all letters - GET /api/admin/letters
    if (route === '/admin/letters' && method === 'GET') {
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return handleCORS(NextResponse.json({ error: 'Authorization required' }, { status: 401 }))
      }

      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      
      if (!decoded || decoded.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Admin access required' }, { status: 403 }))
      }

      const letters = await db.collection('letters')
        .find({})
        .sort({ created_at: -1 })
        .toArray()

      const cleanedLetters = letters.map(({ _id, ...rest }) => rest)
      
      return handleCORS(NextResponse.json({ letters: cleanedLetters }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { 
        error: `Route ${route} not found`,
        available_routes: [
          'POST /auth/register',
          'POST /auth/register-with-coupon',
          'POST /auth/login', 
          'GET /auth/me',
          'POST /coupons/validate',
          'POST /subscription/create-checkout',
          'POST /webhooks/stripe',
          'POST /letters/generate',
          'GET /letters',
          'GET /remote-employee/stats',
          'GET /health'
        ]
      }, 
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute

// Document generation helper functions
function getDocumentSystemPrompt(documentType, category) {
  const categoryPrompts = {
    business_letters: `You are a professional legal letter writer and paralegal assistant working for Talk To My Lawyer. Generate formal, professional, and legally appropriate business letters based on the provided information. 
    
    Guidelines:
    - Use formal business letter format with proper headers and structure
    - Include sender and recipient information when provided
    - Be direct, professional, and clear in communication
    - Use appropriate legal language where applicable
    - Include relevant dates and specific details
    - Ensure the letter achieves the stated objective
    - Maintain a professional but firm tone when appropriate
    - Sign letters as coming from Talk To My Lawyer legal team`,
    
    contracts: `You are a professional legal contract writer and paralegal assistant working for Talk To My Lawyer. Generate comprehensive, legally sound contract documents based on the provided information.
    
    Guidelines:
    - Use formal contract structure with proper clauses and sections
    - Include all necessary legal terms and conditions
    - Be precise and clear in language to avoid ambiguity
    - Include standard contract provisions (governing law, dispute resolution, etc.)
    - Ensure enforceability and legal compliance
    - Use professional contract formatting
    - Include signature blocks and date fields
    - Add appropriate disclaimers and legal notices`,
    
    employment: `You are a professional employment law specialist working for Talk To My Lawyer. Generate comprehensive employment-related documents based on the provided information.
    
    Guidelines:
    - Follow employment law best practices
    - Include relevant employment terms and conditions
    - Be compliant with labor law requirements
    - Use professional employment document formatting
    - Include necessary legal protections for both parties
    - Ensure clarity in roles, responsibilities, and expectations
    - Include appropriate termination and dispute resolution clauses
    - Add compliance with applicable employment regulations`,
    
    real_estate: `You are a professional real estate attorney working for Talk To My Lawyer. Generate comprehensive real estate documents based on the provided information.
    
    Guidelines:
    - Follow real estate law best practices
    - Include property-specific details and legal descriptions
    - Be compliant with real estate regulations
    - Use professional real estate document formatting
    - Include necessary legal protections and disclosures
    - Ensure clarity in property rights and obligations
    - Include appropriate dispute resolution mechanisms
    - Add compliance with applicable real estate laws`,
    
    business_formation: `You are a professional corporate attorney working for Talk To My Lawyer. Generate comprehensive business formation documents based on the provided information.
    
    Guidelines:
    - Follow corporate law best practices
    - Include necessary business structure provisions
    - Be compliant with business formation regulations
    - Use professional corporate document formatting
    - Include governance structures and operating procedures
    - Ensure clarity in business operations and management
    - Include appropriate liability protections
    - Add compliance with applicable business laws`,
    
    legal_notices: `You are a professional legal notice specialist working for Talk To My Lawyer. Generate comprehensive legal notices and compliance documents based on the provided information.
    
    Guidelines:
    - Follow legal notice requirements and best practices
    - Include necessary legal disclosures and notifications
    - Be compliant with applicable regulations
    - Use professional legal notice formatting
    - Include clear legal obligations and rights
    - Ensure enforceability and legal validity
    - Include appropriate legal language and terminology
    - Add compliance with applicable laws and regulations`,
    
    personal_legal: `You are a professional personal legal documents specialist working for Talk To My Lawyer. Generate comprehensive personal legal documents based on the provided information.
    
    Guidelines:
    - Follow personal legal document best practices
    - Include necessary personal legal provisions
    - Be compliant with individual legal requirements
    - Use professional personal legal document formatting
    - Include appropriate legal protections and rights
    - Ensure clarity in personal legal matters
    - Include proper execution and witnessing requirements
    - Add compliance with applicable personal legal laws`
  }
  
  return categoryPrompts[category] || categoryPrompts.business_letters
}

function buildDocumentPrompt(documentType, category, formData, urgencyLevel) {
  let prompt = `Generate a professional ${documentType} document with the following details:\n\n`
  
  // Add common fields
  if (formData.fullName) prompt += `Client Name: ${formData.fullName}\n`
  if (formData.yourAddress) prompt += `Client Address: ${formData.yourAddress}\n`
  if (formData.email) prompt += `Client Email: ${formData.email}\n`
  if (formData.phone) prompt += `Client Phone: ${formData.phone}\n`
  
  // Add recipient info if available
  if (formData.recipientName) prompt += `Recipient: ${formData.recipientName}\n`
  if (formData.recipientAddress) prompt += `Recipient Address: ${formData.recipientAddress}\n`
  if (formData.recipientEmail) prompt += `Recipient Email: ${formData.recipientEmail}\n`
  
  // Add document-specific fields based on category
  switch (category) {
    case 'business_letters':
      if (formData.briefDescription) prompt += `Situation: ${formData.briefDescription}\n`
      if (formData.detailedInformation) prompt += `Details: ${formData.detailedInformation}\n`
      if (formData.whatToAchieve) prompt += `Desired Outcome: ${formData.whatToAchieve}\n`
      if (formData.timeframe) prompt += `Timeframe: ${formData.timeframe}\n`
      if (formData.consequences) prompt += `Consequences: ${formData.consequences}\n`
      break
      
    case 'contracts':
      if (formData.contractType) prompt += `Contract Type: ${formData.contractType}\n`
      if (formData.partyA) prompt += `Party A: ${formData.partyA}\n`
      if (formData.partyB) prompt += `Party B: ${formData.partyB}\n`
      if (formData.terms) prompt += `Terms: ${formData.terms}\n`
      if (formData.duration) prompt += `Duration: ${formData.duration}\n`
      if (formData.compensation) prompt += `Compensation: ${formData.compensation}\n`
      if (formData.responsibilities) prompt += `Responsibilities: ${formData.responsibilities}\n`
      break
      
    case 'employment':
      if (formData.employeeName) prompt += `Employee: ${formData.employeeName}\n`
      if (formData.employerName) prompt += `Employer: ${formData.employerName}\n`
      if (formData.position) prompt += `Position: ${formData.position}\n`
      if (formData.startDate) prompt += `Start Date: ${formData.startDate}\n`
      if (formData.salary) prompt += `Salary: ${formData.salary}\n`
      if (formData.benefits) prompt += `Benefits: ${formData.benefits}\n`
      if (formData.workLocation) prompt += `Work Location: ${formData.workLocation}\n`
      break
      
    case 'real_estate':
      if (formData.propertyAddress) prompt += `Property Address: ${formData.propertyAddress}\n`
      if (formData.propertyType) prompt += `Property Type: ${formData.propertyType}\n`
      if (formData.price) prompt += `Price: ${formData.price}\n`
      if (formData.landlord) prompt += `Landlord: ${formData.landlord}\n`
      if (formData.tenant) prompt += `Tenant: ${formData.tenant}\n`
      if (formData.leaseTerms) prompt += `Lease Terms: ${formData.leaseTerms}\n`
      if (formData.deposit) prompt += `Deposit: ${formData.deposit}\n`
      break
      
    case 'business_formation':
      if (formData.businessName) prompt += `Business Name: ${formData.businessName}\n`
      if (formData.businessType) prompt += `Business Type: ${formData.businessType}\n`
      if (formData.state) prompt += `State: ${formData.state}\n`
      if (formData.owners) prompt += `Owners: ${formData.owners}\n`
      if (formData.purpose) prompt += `Business Purpose: ${formData.purpose}\n`
      if (formData.managementStructure) prompt += `Management Structure: ${formData.managementStructure}\n`
      break
      
    case 'legal_notices':
      if (formData.noticeType) prompt += `Notice Type: ${formData.noticeType}\n`
      if (formData.legalBasis) prompt += `Legal Basis: ${formData.legalBasis}\n`
      if (formData.requirements) prompt += `Requirements: ${formData.requirements}\n`
      if (formData.complianceDetails) prompt += `Compliance Details: ${formData.complianceDetails}\n`
      break
      
    case 'personal_legal':
      if (formData.documentPurpose) prompt += `Document Purpose: ${formData.documentPurpose}\n`
      if (formData.beneficiaries) prompt += `Beneficiaries: ${formData.beneficiaries}\n`
      if (formData.assets) prompt += `Assets: ${formData.assets}\n`
      if (formData.instructions) prompt += `Instructions: ${formData.instructions}\n`
      if (formData.witnesses) prompt += `Witnesses: ${formData.witnesses}\n`
      break
  }
  
  if (urgencyLevel !== 'standard') {
    prompt += `\nUrgency Level: ${urgencyLevel}\n`
  }
  
  prompt += `\nPlease format this as a complete, professional ${documentType} document ready for use.`
  
  return prompt
}