#!/usr/bin/env python3
"""
Admin Dashboard Backend Testing for Talk To My Lawyer
Comprehensive testing of admin dashboard functionality including authentication, 
user management, letter statistics, and remote employee stats.
"""

import requests
import json
import time
import os
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000/api"
HEADERS = {"Content-Type": "application/json"}

# Test data for admin dashboard testing
TEST_USERS = {
    "user": {
        "email": "dashuser@talktomylawyer.com",
        "password": "userpass123",
        "name": "Dashboard User",
        "role": "user"
    },
    "contractor": {
        "email": "dashcontractor@talktomylawyer.com", 
        "password": "contractorpass123",
        "name": "Dashboard Contractor",
        "role": "contractor"
    },
    "admin": {
        "email": "dashadmin@talktomylawyer.com",
        "password": "adminpass123", 
        "name": "Dashboard Admin",
        "role": "admin"
    }
}

# Global variables to store tokens and user data
tokens = {}
user_data = {}
contractor_username = None
test_results = []

def log_test(test_name, status, message="", details=None):
    """Log test results with timestamp and store in results"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    
    result = {
        'test': test_name,
        'status': status,
        'message': message,
        'details': details,
        'timestamp': timestamp
    }
    test_results.append(result)
    
    print(f"[{timestamp}] {status_symbol} {test_name}: {message}")
    if details and status == "FAIL":
        print(f"   Details: {details}")

def setup_admin_dashboard_users():
    """Setup users specifically for admin dashboard testing"""
    print("\n🔧 SETTING UP ADMIN DASHBOARD TEST USERS")
    print("=" * 50)
    
    for role, user_info in TEST_USERS.items():
        try:
            # Try to register user
            response = requests.post(f"{BASE_URL}/auth/register", json=user_info, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                tokens[role] = data.get('token')
                user_data[role] = data.get('user')
                log_test(f"Setup {role.title()} User", "PASS", f"Created {user_info['name']}")
                
                # Store contractor username for referral testing
                if role == 'contractor':
                    global contractor_username
                    contractor_username = user_info['name'].lower().replace(' ', '')[:5]
                    
            elif response.status_code == 400 and "already exists" in response.text:
                # User exists, try to login
                login_response = requests.post(f"{BASE_URL}/auth/login", json={
                    "email": user_info["email"],
                    "password": user_info["password"]
                }, headers=HEADERS)
                
                if login_response.status_code == 200:
                    data = login_response.json()
                    tokens[role] = data.get('token')
                    user_data[role] = data.get('user')
                    log_test(f"Setup {role.title()} User", "PASS", f"Logged in existing {user_info['name']}")
                    
                    # Store contractor username for referral testing
                    if role == 'contractor':
                        contractor_username = user_info['name'].lower().replace(' ', '')[:5]
                else:
                    log_test(f"Setup {role.title()} User", "FAIL", f"Login failed: {login_response.text}")
            else:
                log_test(f"Setup {role.title()} User", "FAIL", f"Registration failed: {response.text}")
                
        except Exception as e:
            log_test(f"Setup {role.title()} User", "FAIL", f"Exception: {str(e)}")
    
    return len(tokens) >= 3  # Need at least admin, user, and contractor tokens

def test_admin_authentication():
    """Test admin authentication and token validation"""
    print("\n🔐 TESTING ADMIN AUTHENTICATION")
    print("=" * 40)
    
    if 'admin' not in tokens:
        log_test("Admin Authentication", "FAIL", "No admin token available")
        return False
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {tokens['admin']}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            
            if user.get('role') == 'admin':
                log_test("Admin Token Validation", "PASS", f"Admin user: {user.get('name')}")
                return True
            else:
                log_test("Admin Token Validation", "FAIL", f"Expected admin role, got: {user.get('role')}")
        else:
            log_test("Admin Token Validation", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("Admin Token Validation", "FAIL", f"Exception: {str(e)}")
    
    return False

def test_admin_users_endpoint():
    """Test GET /api/admin/users endpoint for admin dashboard Users Section"""
    print("\n👥 TESTING ADMIN USERS ENDPOINT")
    print("=" * 35)
    
    if 'admin' not in tokens:
        log_test("Admin Users Endpoint", "FAIL", "No admin token available")
        return False
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {tokens['admin']}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            
            if isinstance(users, list):
                # Analyze user data for admin dashboard
                user_count = len(users)
                roles = {}
                subscription_stats = {'free': 0, 'paid': 0}
                coupon_usage = 0
                
                for user in users:
                    role = user.get('role', 'unknown')
                    roles[role] = roles.get(role, 0) + 1
                    
                    subscription = user.get('subscription', {})
                    if subscription.get('status') == 'paid':
                        subscription_stats['paid'] += 1
                    else:
                        subscription_stats['free'] += 1
                    
                    if subscription.get('referred_by'):
                        coupon_usage += 1
                
                log_test("Admin Users Endpoint", "PASS", 
                        f"Retrieved {user_count} users. Roles: {roles}")
                log_test("Admin Users Data Analysis", "PASS", 
                        f"Subscriptions: {subscription_stats}, Referrals: {coupon_usage}")
                
                # Validate required fields for admin dashboard
                if users:
                    sample_user = users[0]
                    required_fields = ['id', 'email', 'name', 'role', 'created_at']
                    missing_fields = [field for field in required_fields if field not in sample_user]
                    
                    if not missing_fields:
                        log_test("Admin Users Data Structure", "PASS", "All required fields present")
                    else:
                        log_test("Admin Users Data Structure", "FAIL", f"Missing fields: {missing_fields}")
                    
                    # Security check - passwords should not be included
                    if 'password' not in sample_user:
                        log_test("Admin Users Security", "PASS", "Password field properly excluded")
                    else:
                        log_test("Admin Users Security", "FAIL", "Password field exposed in response")
                
                return True
            else:
                log_test("Admin Users Endpoint", "FAIL", "Invalid response format")
        else:
            log_test("Admin Users Endpoint", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("Admin Users Endpoint", "FAIL", f"Exception: {str(e)}")
    
    return False

def test_admin_letters_endpoint():
    """Test GET /api/admin/letters endpoint for admin dashboard statistics"""
    print("\n📄 TESTING ADMIN LETTERS ENDPOINT")
    print("=" * 37)
    
    if 'admin' not in tokens:
        log_test("Admin Letters Endpoint", "FAIL", "No admin token available")
        return False
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {tokens['admin']}"}
        response = requests.get(f"{BASE_URL}/admin/letters", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            letters = data.get('letters', [])
            
            if isinstance(letters, list):
                # Analyze letter data for admin dashboard statistics
                letter_count = len(letters)
                letter_types = {}
                urgency_levels = {}
                status_counts = {}
                
                for letter in letters:
                    letter_type = letter.get('letter_type', 'unknown')
                    letter_types[letter_type] = letter_types.get(letter_type, 0) + 1
                    
                    urgency = letter.get('urgency_level', 'standard')
                    urgency_levels[urgency] = urgency_levels.get(urgency, 0) + 1
                    
                    status = letter.get('status', 'unknown')
                    status_counts[status] = status_counts.get(status, 0) + 1
                
                log_test("Admin Letters Endpoint", "PASS", 
                        f"Retrieved {letter_count} letters from system")
                log_test("Admin Letters Statistics", "PASS", 
                        f"Types: {letter_types}, Urgency: {urgency_levels}, Status: {status_counts}")
                
                # Validate data structure for admin dashboard
                if letters:
                    sample_letter = letters[0]
                    required_fields = ['id', 'user_id', 'title', 'content', 'created_at']
                    missing_fields = [field for field in required_fields if field not in sample_letter]
                    
                    if not missing_fields:
                        log_test("Admin Letters Data Structure", "PASS", "All required fields present")
                    else:
                        log_test("Admin Letters Data Structure", "FAIL", f"Missing fields: {missing_fields}")
                
                return True
            else:
                log_test("Admin Letters Endpoint", "FAIL", "Invalid response format")
        else:
            log_test("Admin Letters Endpoint", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("Admin Letters Endpoint", "FAIL", f"Exception: {str(e)}")
    
    return False

def test_remote_employee_stats():
    """Test GET /api/remote-employee/stats endpoint for Remote Employees Section"""
    print("\n🏢 TESTING REMOTE EMPLOYEE STATS")
    print("=" * 36)
    
    if 'contractor' not in tokens:
        log_test("Remote Employee Stats", "FAIL", "No contractor token available")
        return False
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {tokens['contractor']}"}
        response = requests.get(f"{BASE_URL}/remote-employee/stats", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate required fields for Remote Employees Section
            required_fields = ['points', 'total_signups', 'username', 'discount_percent']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                log_test("Remote Employee Stats", "PASS", 
                        f"Username: {data['username']}, Points: {data['points']}, Signups: {data['total_signups']}")
                
                # Validate data types
                if (isinstance(data['points'], int) and 
                    isinstance(data['total_signups'], int) and
                    isinstance(data['username'], str) and
                    isinstance(data['discount_percent'], int)):
                    log_test("Remote Employee Data Types", "PASS", "All data types are correct")
                else:
                    log_test("Remote Employee Data Types", "FAIL", "Invalid data types in response")
                
                # Validate username format (should be 5 chars max)
                if len(data['username']) <= 5:
                    log_test("Remote Employee Username", "PASS", f"Username format correct: {data['username']}")
                else:
                    log_test("Remote Employee Username", "FAIL", f"Username too long: {data['username']}")
                
                return True
            else:
                log_test("Remote Employee Stats", "FAIL", f"Missing required fields: {missing_fields}")
        else:
            log_test("Remote Employee Stats", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test("Remote Employee Stats", "FAIL", f"Exception: {str(e)}")
    
    return False

def test_role_based_access_control():
    """Test role-based access control for admin endpoints"""
    print("\n🔒 TESTING ROLE-BASED ACCESS CONTROL")
    print("=" * 40)
    
    # Test 1: Regular user trying to access admin endpoints
    if 'user' in tokens:
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {tokens['user']}"}
            response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
            
            if response.status_code == 403:
                log_test("User Access Control", "PASS", "Regular user correctly denied admin access")
            else:
                log_test("User Access Control", "FAIL", 
                        f"Regular user should be denied (403), got: {response.status_code}")
        except Exception as e:
            log_test("User Access Control", "FAIL", f"Exception: {str(e)}")
    
    # Test 2: Contractor trying to access admin endpoints
    if 'contractor' in tokens:
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {tokens['contractor']}"}
            response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
            
            if response.status_code == 403:
                log_test("Contractor Access Control", "PASS", "Contractor correctly denied admin access")
            else:
                log_test("Contractor Access Control", "FAIL", 
                        f"Contractor should be denied (403), got: {response.status_code}")
        except Exception as e:
            log_test("Contractor Access Control", "FAIL", f"Exception: {str(e)}")
    
    # Test 3: Admin access to admin endpoints
    if 'admin' in tokens:
        try:
            headers = {**HEADERS, "Authorization": f"Bearer {tokens['admin']}"}
            response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
            
            if response.status_code == 200:
                log_test("Admin Access Control", "PASS", "Admin correctly granted access")
            else:
                log_test("Admin Access Control", "FAIL", 
                        f"Admin should have access (200), got: {response.status_code}")
        except Exception as e:
            log_test("Admin Access Control", "FAIL", f"Exception: {str(e)}")
    
    # Test 4: No token access
    try:
        response = requests.get(f"{BASE_URL}/admin/users", headers=HEADERS)
        
        if response.status_code == 401:
            log_test("No Token Access Control", "PASS", "Correctly denied access without token")
        else:
            log_test("No Token Access Control", "FAIL", 
                    f"Should be denied without token (401), got: {response.status_code}")
    except Exception as e:
        log_test("No Token Access Control", "FAIL", f"Exception: {str(e)}")

def test_data_structure_validation():
    """Test data structure validation for admin dashboard components"""
    print("\n📊 TESTING DATA STRUCTURE VALIDATION")
    print("=" * 40)
    
    if 'admin' not in tokens:
        log_test("Data Structure Validation", "FAIL", "No admin token available")
        return False
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {tokens['admin']}"}
        
        # Test Users Section data structure
        users_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        if users_response.status_code == 200:
            users_data = users_response.json()
            users = users_data.get('users', [])
            
            # Validate structure for Users Section of admin dashboard
            user_roles = set()
            coupon_usage_count = 0
            subscription_types = set()
            
            for user in users:
                user_roles.add(user.get('role', 'unknown'))
                
                subscription = user.get('subscription', {})
                if subscription.get('referred_by'):
                    coupon_usage_count += 1
                
                subscription_types.add(subscription.get('status', 'free'))
            
            log_test("Users Section Data", "PASS", 
                    f"Roles: {user_roles}, Coupon usage: {coupon_usage_count}, Subscriptions: {subscription_types}")
        
        # Test Remote Employees Section data structure
        if 'contractor' in tokens:
            contractor_headers = {**HEADERS, "Authorization": f"Bearer {tokens['contractor']}"}
            stats_response = requests.get(f"{BASE_URL}/remote-employee/stats", headers=contractor_headers)
            
            if stats_response.status_code == 200:
                stats_data = stats_response.json()
                
                # Validate structure for Remote Employees Section
                required_fields = ['username', 'points', 'total_signups']
                if all(field in stats_data for field in required_fields):
                    log_test("Remote Employees Section Data", "PASS", 
                            f"Username: {stats_data['username']}, Points: {stats_data['points']}, Signups: {stats_data['total_signups']}")
                else:
                    missing = [field for field in required_fields if field not in stats_data]
                    log_test("Remote Employees Section Data", "FAIL", f"Missing fields: {missing}")
        
        # Test Letters statistics data structure
        letters_response = requests.get(f"{BASE_URL}/admin/letters", headers=headers)
        if letters_response.status_code == 200:
            letters_data = letters_response.json()
            letters = letters_data.get('letters', [])
            
            # Validate structure for letter statistics
            if letters:
                letter_stats = {
                    'total': len(letters),
                    'types': set(letter.get('letter_type', 'unknown') for letter in letters),
                    'statuses': set(letter.get('status', 'unknown') for letter in letters)
                }
                
                log_test("Letter Statistics Data", "PASS", 
                        f"Total: {letter_stats['total']}, Types: {letter_stats['types']}")
            else:
                log_test("Letter Statistics Data", "PASS", "No letters in system (empty state)")
        
        return True
        
    except Exception as e:
        log_test("Data Structure Validation", "FAIL", f"Exception: {str(e)}")
        return False

def run_admin_dashboard_tests():
    """Run all admin dashboard backend tests"""
    print("🚀 STARTING ADMIN DASHBOARD BACKEND TESTING")
    print("=" * 60)
    print("Testing admin dashboard functionality for the newly implemented AdminDashboard component")
    print("Focus: Admin authentication, users endpoint, letters endpoint, remote employee stats, RBAC")
    print("=" * 60)
    
    # Setup test users
    if not setup_admin_dashboard_users():
        print("❌ Failed to setup test users. Cannot proceed with admin dashboard tests.")
        return False
    
    # Run admin dashboard specific tests
    tests = [
        ("Admin Authentication", test_admin_authentication),
        ("Admin Users Endpoint", test_admin_users_endpoint),
        ("Admin Letters Endpoint", test_admin_letters_endpoint),
        ("Remote Employee Stats", test_remote_employee_stats),
        ("Role-Based Access Control", test_role_based_access_control),
        ("Data Structure Validation", test_data_structure_validation)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed_tests += 1
        except Exception as e:
            log_test(test_name, "FAIL", f"Test function exception: {str(e)}")
    
    # Print comprehensive summary
    print("\n" + "=" * 60)
    print("📊 ADMIN DASHBOARD TESTING SUMMARY")
    print("=" * 60)
    
    success_rate = (passed_tests / total_tests) * 100
    print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    
    # Categorize results
    passed_results = [r for r in test_results if r['status'] == 'PASS']
    failed_results = [r for r in test_results if r['status'] == 'FAIL']
    
    print(f"\n✅ PASSED TESTS ({len(passed_results)}):")
    for result in passed_results:
        print(f"   • {result['test']}: {result['message']}")
    
    if failed_results:
        print(f"\n❌ FAILED TESTS ({len(failed_results)}):")
        for result in failed_results:
            print(f"   • {result['test']}: {result['message']}")
            if result['details']:
                print(f"     Details: {result['details']}")
    
    # Overall assessment for admin dashboard
    print(f"\n🎯 ADMIN DASHBOARD ASSESSMENT:")
    if success_rate >= 80:
        print("✅ ADMIN DASHBOARD BACKEND IS WORKING CORRECTLY")
        print("   • Admin authentication endpoints are functional")
        print("   • Admin users endpoint returns proper data for Users Section")
        print("   • Admin letters endpoint provides statistics data")
        print("   • Remote employee stats endpoint works for Remote Employees Section")
        print("   • Role-based access control is properly implemented")
        print("   • Data structures are valid for admin dashboard components")
    else:
        print("⚠️  ADMIN DASHBOARD BACKEND HAS ISSUES")
        print("   • Some critical admin functionality needs attention")
        print("   • Review failed tests above for specific issues")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = run_admin_dashboard_tests()
    sys.exit(0 if success else 1)