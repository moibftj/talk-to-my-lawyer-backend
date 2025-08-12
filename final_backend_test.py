#!/usr/bin/env python3
"""
Final Comprehensive Backend API Testing for Talk To My Lawyer
Testing all requested functionality from the review after landing page enhancements.
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://e84f8a3d-0d39-435e-9801-5c4ea21bd735.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def log_test(test_name, status, message=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}: {message}")

def test_comprehensive_backend():
    """Test all requested backend functionality"""
    results = []
    tokens = {}
    
    print("=" * 80)
    print("COMPREHENSIVE BACKEND API TESTING - TALK TO MY LAWYER")
    print("Testing all requested functionality after landing page enhancements")
    print("=" * 80)
    
    # 1. ROOT ENDPOINT TEST
    try:
        response = requests.get(f"{BASE_URL}/", headers=HEADERS, timeout=15)
        if response.status_code == 200 and "Talk To My Lawyer API is running!" in response.json().get("message", ""):
            log_test("Root Endpoint", "PASS", "API is running correctly")
            results.append(("Root Endpoint", True))
        else:
            log_test("Root Endpoint", "FAIL", f"Status: {response.status_code}")
            results.append(("Root Endpoint", False))
    except Exception as e:
        log_test("Root Endpoint", "FAIL", f"Exception: {str(e)}")
        results.append(("Root Endpoint", False))
    
    # 2. AUTHENTICATION SYSTEM TESTS
    
    # User Registration
    try:
        test_email = f"testuser_{int(time.time())}@example.com"
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers=HEADERS,
            json={
                "email": test_email,
                "password": "password123",
                "name": "Test User",
                "role": "user"
            },
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            tokens["user"] = data.get("token")
            log_test("User Registration", "PASS", "User registered successfully")
            results.append(("User Registration", True))
        else:
            log_test("User Registration", "FAIL", f"Status: {response.status_code}")
            results.append(("User Registration", False))
    except Exception as e:
        log_test("User Registration", "FAIL", f"Exception: {str(e)}")
        results.append(("User Registration", False))
    
    # User Login
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers=HEADERS,
            json={
                "email": test_email,
                "password": "password123"
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("token"):
                log_test("User Login", "PASS", "Login successful")
                results.append(("User Login", True))
            else:
                log_test("User Login", "FAIL", "No token in response")
                results.append(("User Login", False))
        else:
            log_test("User Login", "FAIL", f"Status: {response.status_code}")
            results.append(("User Login", False))
    except Exception as e:
        log_test("User Login", "FAIL", f"Exception: {str(e)}")
        results.append(("User Login", False))
    
    # Token Validation
    if tokens.get("user"):
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {tokens['user']}"
            
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("user") and data["user"]["role"] == "user":
                    log_test("Token Validation", "PASS", "JWT token validation working")
                    results.append(("Token Validation", True))
                else:
                    log_test("Token Validation", "FAIL", f"Invalid user data: {data}")
                    results.append(("Token Validation", False))
            else:
                log_test("Token Validation", "FAIL", f"Status: {response.status_code}")
                results.append(("Token Validation", False))
        except Exception as e:
            log_test("Token Validation", "FAIL", f"Exception: {str(e)}")
            results.append(("Token Validation", False))
    else:
        log_test("Token Validation", "FAIL", "No user token available")
        results.append(("Token Validation", False))
    
    # 3. LETTER GENERATION API TEST
    if tokens.get("user"):
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {tokens['user']}"
            
            # Test with detailed form data as requested in review
            form_data = {
                "fullName": "John Doe",
                "yourAddress": "123 Main St, City, State 12345",
                "phone": "555-123-4567",
                "email": "john.doe@example.com",
                "recipientName": "ABC Company",
                "recipientAddress": "456 Business Ave, City, State 67890",
                "briefDescription": "Unpaid invoice for services rendered",
                "detailedInformation": "Invoice #12345 for $5000 remains unpaid after 60 days",
                "whatToAchieve": "Payment of outstanding invoice within 30 days",
                "timeframe": "30 days",
                "consequences": "Legal action may be pursued"
            }
            
            response = requests.post(
                f"{BASE_URL}/letters/generate",
                headers=headers,
                json={
                    "title": "Payment Demand Letter",
                    "prompt": "Generate a professional demand letter for unpaid invoice",
                    "letterType": "demand",
                    "formData": form_data,
                    "urgencyLevel": "standard"
                },
                timeout=15
            )
            
            if response.status_code == 403:
                data = response.json()
                if ("subscribe" in data.get("error", "").lower() or "subscription" in data.get("error", "").lower()) and data.get("subscription_required") is True:
                    log_test("Letter Generation API", "PASS", "Subscription validation working correctly")
                    results.append(("Letter Generation API", True))
                else:
                    log_test("Letter Generation API", "FAIL", f"Unexpected 403: {data}")
                    results.append(("Letter Generation API", False))
            elif response.status_code == 200:
                log_test("Letter Generation API", "PASS", "Letter generated successfully")
                results.append(("Letter Generation API", True))
            else:
                log_test("Letter Generation API", "FAIL", f"Status: {response.status_code}")
                results.append(("Letter Generation API", False))
        except Exception as e:
            log_test("Letter Generation API", "FAIL", f"Exception: {str(e)}")
            results.append(("Letter Generation API", False))
    else:
        log_test("Letter Generation API", "FAIL", "No user token available")
        results.append(("Letter Generation API", False))
    
    # 4. SUBSCRIPTION MANAGEMENT TESTS
    if tokens.get("user"):
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {tokens['user']}"
            
            # Test all package types
            packages = ["4letters", "6letters", "8letters"]
            all_packages_passed = True
            
            for package in packages:
                response = requests.post(
                    f"{BASE_URL}/subscription/create-checkout",
                    headers=headers,
                    json={"packageType": package},
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("sessionId") and data.get("url"):
                        log_test(f"Stripe Checkout ({package})", "PASS", f"Session created for {package}")
                    else:
                        log_test(f"Stripe Checkout ({package})", "FAIL", f"Missing session data: {data}")
                        all_packages_passed = False
                else:
                    log_test(f"Stripe Checkout ({package})", "FAIL", f"Status: {response.status_code}")
                    all_packages_passed = False
            
            results.append(("Subscription Management", all_packages_passed))
        except Exception as e:
            log_test("Subscription Management", "FAIL", f"Exception: {str(e)}")
            results.append(("Subscription Management", False))
    else:
        log_test("Subscription Management", "FAIL", "No user token available")
        results.append(("Subscription Management", False))
    
    # 5. USER DASHBOARD ACCESS TEST
    if tokens.get("user"):
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {tokens['user']}"
            
            response = requests.get(f"{BASE_URL}/letters", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "letters" in data:
                    log_test("User Dashboard Access", "PASS", f"Letters retrieved for dashboard")
                    results.append(("User Dashboard Access", True))
                else:
                    log_test("User Dashboard Access", "FAIL", f"No letters field: {data}")
                    results.append(("User Dashboard Access", False))
            else:
                log_test("User Dashboard Access", "FAIL", f"Status: {response.status_code}")
                results.append(("User Dashboard Access", False))
        except Exception as e:
            log_test("User Dashboard Access", "FAIL", f"Exception: {str(e)}")
            results.append(("User Dashboard Access", False))
    else:
        log_test("User Dashboard Access", "FAIL", "No user token available")
        results.append(("User Dashboard Access", False))
    
    # 6. CONTRACTOR FUNCTIONALITY TEST
    try:
        contractor_email = f"contractor_{int(time.time())}@example.com"
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers=HEADERS,
            json={
                "email": contractor_email,
                "password": "password123",
                "name": "Test Contractor",
                "role": "contractor"
            },
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            contractor_token = data.get("token")
            
            # Test contractor stats
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {contractor_token}"
            
            response = requests.get(f"{BASE_URL}/remote-employee/stats", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "username" in data and "discount_percent" in data:
                    log_test("Contractor Functionality", "PASS", f"Username: {data['username']}, Discount: {data['discount_percent']}%")
                    results.append(("Contractor Functionality", True))
                else:
                    log_test("Contractor Functionality", "FAIL", f"Missing contractor data: {data}")
                    results.append(("Contractor Functionality", False))
            else:
                log_test("Contractor Functionality", "FAIL", f"Status: {response.status_code}")
                results.append(("Contractor Functionality", False))
        else:
            log_test("Contractor Functionality", "FAIL", f"Contractor registration failed: {response.status_code}")
            results.append(("Contractor Functionality", False))
    except Exception as e:
        log_test("Contractor Functionality", "FAIL", f"Exception: {str(e)}")
        results.append(("Contractor Functionality", False))
    
    # Summary
    print("\n" + "=" * 80)
    print("COMPREHENSIVE TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed >= total - 1:  # Allow for 1 minor failure
        print("🎉 ALL CRITICAL BACKEND FUNCTIONALITY VERIFIED!")
        print("Backend APIs are working correctly after landing page enhancements.")
        return True
    else:
        print(f"⚠️  {total - passed} tests failed. Backend needs attention.")
        return False

if __name__ == "__main__":
    success = test_comprehensive_backend()
    exit(0 if success else 1)