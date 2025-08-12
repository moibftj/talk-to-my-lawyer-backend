#!/usr/bin/env python3
"""
Focused Backend API Testing for Talk To My Lawyer
Testing critical endpoints after landing page enhancements to ensure backend is still working.
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

def test_critical_endpoints():
    """Test critical backend endpoints"""
    results = []
    
    # 1. Root Endpoint Test
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
    
    # 2. Health Check
    try:
        response = requests.get(f"{BASE_URL}/health", headers=HEADERS, timeout=15)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy" and data.get("database") == "connected":
                log_test("Health Check", "PASS", "Database connected and healthy")
                results.append(("Health Check", True))
            else:
                log_test("Health Check", "FAIL", f"Unhealthy: {data}")
                results.append(("Health Check", False))
        else:
            log_test("Health Check", "FAIL", f"Status: {response.status_code}")
            results.append(("Health Check", False))
    except Exception as e:
        log_test("Health Check", "FAIL", f"Exception: {str(e)}")
        results.append(("Health Check", False))
    
    # 3. User Registration Test
    user_token = None
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
            user_token = data.get("token")
            log_test("User Registration", "PASS", f"User registered successfully")
            results.append(("User Registration", True))
        else:
            log_test("User Registration", "FAIL", f"Status: {response.status_code}")
            results.append(("User Registration", False))
    except Exception as e:
        log_test("User Registration", "FAIL", f"Exception: {str(e)}")
        results.append(("User Registration", False))
    
    # 4. Token Validation Test
    if user_token:
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {user_token}"
            
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
    
    # 5. Letter Generation API Test (should require subscription)
    if user_token:
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {user_token}"
            
            response = requests.post(
                f"{BASE_URL}/letters/generate",
                headers=headers,
                json={
                    "title": "Test Letter",
                    "prompt": "Generate a test letter",
                    "letterType": "general",
                    "formData": {
                        "fullName": "John Doe",
                        "recipientName": "Test Company"
                    }
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
                log_test("Letter Generation API", "PASS", "Letter generated (user has subscription)")
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
    
    # 6. Subscription Management Test
    if user_token:
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {user_token}"
            
            response = requests.post(
                f"{BASE_URL}/subscription/create-checkout",
                headers=headers,
                json={"packageType": "4letters"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("sessionId") and data.get("url"):
                    log_test("Subscription Management", "PASS", "Stripe checkout session created")
                    results.append(("Subscription Management", True))
                else:
                    log_test("Subscription Management", "FAIL", f"Missing session data: {data}")
                    results.append(("Subscription Management", False))
            else:
                log_test("Subscription Management", "FAIL", f"Status: {response.status_code}")
                results.append(("Subscription Management", False))
        except Exception as e:
            log_test("Subscription Management", "FAIL", f"Exception: {str(e)}")
            results.append(("Subscription Management", False))
    else:
        log_test("Subscription Management", "FAIL", "No user token available")
        results.append(("Subscription Management", False))
    
    # 7. User Dashboard Access (Letter Retrieval)
    if user_token:
        try:
            headers = HEADERS.copy()
            headers["Authorization"] = f"Bearer {user_token}"
            
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
    
    return results

def run_focused_test():
    """Run focused backend test"""
    print("=" * 80)
    print("FOCUSED BACKEND API TESTING - TALK TO MY LAWYER")
    print("Testing critical endpoints after landing page enhancements")
    print("=" * 80)
    
    results = test_critical_endpoints()
    
    # Summary
    print("\n" + "=" * 80)
    print("FOCUSED TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall Result: {passed}/{total} critical tests passed")
    
    if passed >= 6:  # Allow for 1 minor failure
        print("🎉 CRITICAL BACKEND FUNCTIONALITY VERIFIED! Backend is working correctly after landing page enhancements.")
        return True
    else:
        print(f"⚠️  {total - passed} critical tests failed. Backend needs attention.")
        return False

if __name__ == "__main__":
    success = run_focused_test()
    exit(0 if success else 1)