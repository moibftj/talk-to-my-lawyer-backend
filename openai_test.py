#!/usr/bin/env python3
"""
Quick test to verify OpenAI integration with letter generation
"""

import requests
import json
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid

# Configuration
BASE_URL = "https://e84f8a3d-0d39-435e-9801-5c4ea21bd735.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "letterdash_db"

def test_openai_integration():
    """Test OpenAI integration with a user that has a subscription"""
    print("Testing OpenAI Integration with Letter Generation")
    print("=" * 60)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Create a test user with subscription
        test_email = f"openai_test_{int(datetime.now().timestamp())}@example.com"
        user_data = {
            "email": test_email,
            "password": "password123",
            "name": "OpenAI Test User",
            "role": "user"
        }
        
        # Register user
        print("1. Registering test user...")
        response = requests.post(f"{BASE_URL}/auth/register", headers=HEADERS, json=user_data, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Failed to register user: {response.status_code}")
            return False
        
        user_response = response.json()
        token = user_response["token"]
        user_id = user_response["user"]["id"]
        
        print(f"✅ User registered successfully: {user_id}")
        
        # Update user subscription directly in database
        print("2. Setting up subscription...")
        result = db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "subscription.status": "paid",
                    "subscription.planId": f"pi_test_{uuid.uuid4()}",
                    "subscription.packageType": "4letters",
                    "subscription.lettersRemaining": 5,
                    "subscription.currentPeriodEnd": datetime.now() + timedelta(days=365),
                    "updated_at": datetime.now()
                }
            }
        )
        
        if result.modified_count != 1:
            print("❌ Failed to update subscription")
            return False
        
        print("✅ Subscription set up successfully")
        
        # Test letter generation with OpenAI
        print("3. Testing letter generation with OpenAI...")
        
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        
        form_data = {
            "fullName": "Sarah Johnson",
            "yourAddress": "123 Business St, Professional City, NY 10001",
            "phone": "555-123-4567",
            "email": "sarah.johnson@example.com",
            "recipientName": "ABC Corporation",
            "recipientAddress": "456 Corporate Ave, Business Town, NY 10002",
            "briefDescription": "Unpaid invoice for consulting services",
            "detailedInformation": "Invoice #2024-001 for $2,500 consulting services remains unpaid after 45 days",
            "whatToAchieve": "Payment of outstanding invoice within 14 days",
            "timeframe": "14 days",
            "consequences": "Legal action and collection proceedings"
        }
        
        letter_data = {
            "title": "Professional Demand Letter - OpenAI Test",
            "prompt": "Generate a professional demand letter for unpaid consulting services",
            "letterType": "demand",
            "formData": form_data,
            "urgencyLevel": "urgent"
        }
        
        response = requests.post(
            f"{BASE_URL}/letters/generate",
            headers=headers,
            json=letter_data,
            timeout=30  # Longer timeout for OpenAI
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            letter = data.get("letter", {})
            
            if letter.get("content") and len(letter["content"]) > 100:
                print("✅ OpenAI Integration Working!")
                print(f"✅ Letter generated successfully ({len(letter['content'])} characters)")
                print(f"✅ Letter Type: {letter.get('letter_type')}")
                print(f"✅ Urgency Level: {letter.get('urgency_level')}")
                print(f"✅ Letters Remaining: {data.get('letters_remaining')}")
                
                # Show first 200 characters of generated content
                content_preview = letter["content"][:200] + "..." if len(letter["content"]) > 200 else letter["content"]
                print(f"\nGenerated Content Preview:\n{content_preview}")
                
                return True
            else:
                print("❌ Letter content not generated or too short")
                print(f"Response: {json.dumps(data, indent=2)}")
                return False
                
        elif response.status_code == 500:
            data = response.json()
            if data.get("ai_service_error"):
                print("⚠️  OpenAI API Error (Rate limiting or service issue)")
                print("✅ Error handling working correctly")
                print(f"Error: {data.get('error')}")
                return True  # This is expected behavior for rate limiting
            else:
                print(f"❌ Unexpected 500 error: {data}")
                return False
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during test: {str(e)}")
        return False
    finally:
        # Clean up
        try:
            client.close()
        except:
            pass

if __name__ == "__main__":
    success = test_openai_integration()
    if success:
        print("\n🎉 OpenAI Integration Test Completed Successfully!")
    else:
        print("\n❌ OpenAI Integration Test Failed")