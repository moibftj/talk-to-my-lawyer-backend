#!/usr/bin/env python3
"""
Comprehensive Authentication System Testing for LetterDash
Tests all authentication endpoints and functionality after recent fixes
"""

import requests
import json
import time
import uuid
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://e84f8a3d-0d39-435e-9801-5c4ea21bd735.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

class AuthenticationTester:
    def __init__(self):
        self.base_url = API_URL
        self.test_users = {
            'user': {
                'email': f'sarah.johnson.{uuid.uuid4().hex[:8]}@example.com',
                'password': 'SecurePass123!',
                'name': 'Sarah Johnson'
            },
            'contractor': {
                'email': f'mike.contractor.{uuid.uuid4().hex[:8]}@example.com',
                'password': 'ContractorPass456!',
                'name': 'Mike Thompson'  # This will generate username 'miket' (5 chars max)
            },
            'admin': {
                'email': f'admin.user.{uuid.uuid4().hex[:8]}@example.com',
                'password': 'AdminPass789!',
                'name': 'Admin User'
            }
        }
        self.tokens = {}
        self.user_ids = {}
        self.contractor_username = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Root Endpoint", True, "API is running", data.get('message'))
                return True
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration with different roles"""
        all_passed = True
        
        for role in ['user', 'contractor', 'admin']:
            try:
                test_case = self.test_users[role].copy()
                if role != 'user':
                    test_case['role'] = role
                
                response = requests.post(
                    f"{self.base_url}/auth/register",
                    json=test_case,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    token = data.get('token')
                    
                    # Store user data and token for later tests
                    self.user_ids[role] = user_data.get('id')
                    self.tokens[role] = token
                    
                    # For contractor, get the username (referral code)
                    if role == 'contractor':
                        # The username should be generated from the name
                        expected_username = test_case['name'].lower().replace(' ', '').replace('.', '')[:5]
                        self.contractor_username = expected_username
                    
                    # Verify response structure
                    if (user_data.get('email') == test_case['email'] and 
                        user_data.get('role') == role and
                        token):
                        self.log_test(
                            f"User Registration ({role})", 
                            True, 
                            f"Successfully registered {role} user",
                            f"User ID: {user_data.get('id')}, Token received"
                        )
                    else:
                        self.log_test(
                            f"User Registration ({role})", 
                            False, 
                            "Invalid response structure",
                            data
                        )
                        all_passed = False
                else:
                    self.log_test(
                        f"User Registration ({role})", 
                        False, 
                        f"Status: {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    f"User Registration ({role})", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        return all_passed
    
    def test_user_login(self):
        """Test login functionality with registered users"""
        all_passed = True
        
        for role in ['user', 'contractor', 'admin']:
            try:
                login_data = {
                    'email': self.test_users[role]['email'],
                    'password': self.test_users[role]['password']
                }
                
                response = requests.post(
                    f"{self.base_url}/auth/login",
                    json=login_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    token = data.get('token')
                    
                    if (user_data.get('email') == login_data['email'] and 
                        user_data.get('role') == role and
                        token):
                        self.log_test(
                            f"User Login ({role})", 
                            True, 
                            f"Successfully logged in {role} user",
                            f"User ID: {user_data.get('id')}"
                        )
                        # Update token for further tests
                        self.tokens[role] = token
                    else:
                        self.log_test(
                            f"User Login ({role})", 
                            False, 
                            "Invalid login response",
                            data
                        )
                        all_passed = False
                else:
                    self.log_test(
                        f"User Login ({role})", 
                        False, 
                        f"Status: {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    f"User Login ({role})", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        return all_passed
    
    def test_auth_me_endpoint(self):
        """Test the /api/auth/me endpoint for token validation"""
        all_passed = True
        
        for role in ['user', 'contractor', 'admin']:
            if role not in self.tokens:
                continue
                
            try:
                headers = {
                    'Authorization': f'Bearer {self.tokens[role]}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f"{self.base_url}/auth/me",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    user_data = data.get('user', {})
                    
                    if user_data.get('role') == role:
                        self.log_test(
                            f"Auth Me Endpoint ({role})", 
                            True, 
                            f"Token validation successful for {role}",
                            f"User: {user_data.get('name')}"
                        )
                    else:
                        self.log_test(
                            f"Auth Me Endpoint ({role})", 
                            False, 
                            "Invalid user data returned",
                            data
                        )
                        all_passed = False
                else:
                    self.log_test(
                        f"Auth Me Endpoint ({role})", 
                        False, 
                        f"Status: {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    f"Auth Me Endpoint ({role})", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        return all_passed
    
    def test_referral_code_system(self):
        """Test the referral code system for contractors"""
        all_passed = True
        
        # First, get contractor stats to get the referral code
        if 'contractor' not in self.tokens:
            self.log_test("Referral Code System", False, "No contractor token available")
            return False
        
        try:
            # Get contractor stats to retrieve the username (referral code)
            headers = {
                'Authorization': f'Bearer {self.tokens["contractor"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.base_url}/remote-employee/stats",
                headers=headers
            )
            
            if response.status_code == 200:
                stats_data = response.json()
                referral_code = stats_data.get('username')
                
                if referral_code:
                    self.contractor_username = referral_code
                    self.log_test(
                        "Get Referral Code", 
                        True, 
                        f"Retrieved referral code: {referral_code}",
                        f"Points: {stats_data.get('points')}, Signups: {stats_data.get('total_signups')}"
                    )
                    
                    # Test coupon validation
                    validate_response = requests.post(
                        f"{self.base_url}/coupons/validate",
                        json={'coupon_code': referral_code},
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if validate_response.status_code == 200:
                        validate_data = validate_response.json()
                        if validate_data.get('valid') and validate_data.get('discount_percent') == 20:
                            self.log_test(
                                "Referral Code Validation", 
                                True, 
                                f"Referral code {referral_code} is valid with 20% discount"
                            )
                        else:
                            self.log_test(
                                "Referral Code Validation", 
                                False, 
                                "Invalid validation response",
                                validate_data
                            )
                            all_passed = False
                    else:
                        self.log_test(
                            "Referral Code Validation", 
                            False, 
                            f"Validation failed with status: {validate_response.status_code}",
                            validate_response.text
                        )
                        all_passed = False
                else:
                    self.log_test(
                        "Get Referral Code", 
                        False, 
                        "No referral code found in contractor stats",
                        stats_data
                    )
                    all_passed = False
            else:
                self.log_test(
                    "Get Referral Code", 
                    False, 
                    f"Failed to get contractor stats: {response.status_code}",
                    response.text
                )
                all_passed = False
                
        except Exception as e:
            self.log_test(
                "Referral Code System", 
                False, 
                f"Exception: {str(e)}"
            )
            all_passed = False
        
        return all_passed
    
    def test_registration_with_coupon(self):
        """Test registration with coupon functionality"""
        # Use the referral code from contractor
        if not self.contractor_username:
            self.log_test("Registration with Coupon", False, "No referral code available")
            return False
        
        try:
            # Test registration with coupon
            coupon_user_data = {
                'email': f'coupon.user.{uuid.uuid4().hex[:8]}@example.com',
                'password': 'CouponUser123!',
                'name': 'Coupon User',
                'role': 'user',
                'coupon_code': self.contractor_username
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register-with-coupon",
                json=coupon_user_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                user_data = data.get('user', {})
                token = data.get('token')
                
                # Check if user has discount applied
                subscription = user_data.get('subscription', {})
                if (subscription.get('discount_percent') == 20 and
                    token and
                    user_data.get('email') == coupon_user_data['email']):
                    
                    self.log_test(
                        "Registration with Coupon", 
                        True, 
                        f"Successfully registered user with {self.contractor_username} coupon",
                        f"20% discount applied, User ID: {user_data.get('id')}"
                    )
                    
                    # Store for cleanup
                    self.user_ids['coupon_user'] = user_data.get('id')
                    self.tokens['coupon_user'] = token
                    
                    # Verify contractor got points
                    time.sleep(1)  # Brief delay for database update
                    headers = {
                        'Authorization': f'Bearer {self.tokens["contractor"]}',
                        'Content-Type': 'application/json'
                    }
                    updated_stats_response = requests.get(
                        f"{self.base_url}/remote-employee/stats",
                        headers=headers
                    )
                    
                    if updated_stats_response.status_code == 200:
                        updated_stats = updated_stats_response.json()
                        if updated_stats.get('total_signups', 0) >= 1:
                            self.log_test(
                                "Contractor Points Update", 
                                True, 
                                f"Contractor received points for referral",
                                f"Signup count: {updated_stats.get('total_signups')}"
                            )
                        else:
                            self.log_test(
                                "Contractor Points Update", 
                                False, 
                                "Contractor points not updated properly",
                                f"Signup count: {updated_stats.get('total_signups')}"
                            )
                            return False
                    
                    return True
                else:
                    self.log_test(
                        "Registration with Coupon", 
                        False, 
                        "Discount not applied correctly",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Registration with Coupon", 
                    False, 
                    f"Registration failed with status: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Registration with Coupon", 
                False, 
                f"Exception: {str(e)}"
            )
            return False
    
    def test_role_based_access_control(self):
        """Test role-based access control"""
        all_passed = True
        
        # Test user trying to access contractor endpoint
        if 'user' in self.tokens:
            try:
                headers = {
                    'Authorization': f'Bearer {self.tokens["user"]}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f"{self.base_url}/remote-employee/stats",
                    headers=headers
                )
                
                if response.status_code == 403:
                    self.log_test(
                        "RBAC - User Access Denied", 
                        True, 
                        "User correctly denied access to contractor endpoint"
                    )
                else:
                    self.log_test(
                        "RBAC - User Access Denied", 
                        False, 
                        f"Expected 403, got {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    "RBAC - User Access Denied", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        # Test contractor trying to access admin endpoint
        if 'contractor' in self.tokens:
            try:
                headers = {
                    'Authorization': f'Bearer {self.tokens["contractor"]}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f"{self.base_url}/admin/users",
                    headers=headers
                )
                
                if response.status_code == 403:
                    self.log_test(
                        "RBAC - Contractor Access Denied", 
                        True, 
                        "Contractor correctly denied access to admin endpoint"
                    )
                else:
                    self.log_test(
                        "RBAC - Contractor Access Denied", 
                        False, 
                        f"Expected 403, got {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    "RBAC - Contractor Access Denied", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        # Test admin accessing admin endpoint
        if 'admin' in self.tokens:
            try:
                headers = {
                    'Authorization': f'Bearer {self.tokens["admin"]}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f"{self.base_url}/admin/users",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'users' in data:
                        self.log_test(
                            "RBAC - Admin Access Granted", 
                            True, 
                            f"Admin successfully accessed users endpoint",
                            f"Found {len(data['users'])} users"
                        )
                    else:
                        self.log_test(
                            "RBAC - Admin Access Granted", 
                            False, 
                            "Invalid admin response structure",
                            data
                        )
                        all_passed = False
                else:
                    self.log_test(
                        "RBAC - Admin Access Granted", 
                        False, 
                        f"Admin access failed with status: {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(
                    "RBAC - Admin Access Granted", 
                    False, 
                    f"Exception: {str(e)}"
                )
                all_passed = False
        
        return all_passed
    
    def test_invalid_token_handling(self):
        """Test handling of invalid tokens"""
        try:
            # Test with invalid token
            headers = {
                'Authorization': 'Bearer invalid_token_here',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.base_url}/auth/me",
                headers=headers
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Invalid Token Handling", 
                    True, 
                    "Invalid token correctly rejected"
                )
                return True
            else:
                self.log_test(
                    "Invalid Token Handling", 
                    False, 
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Invalid Token Handling", 
                False, 
                f"Exception: {str(e)}"
            )
            return False
    
    def test_password_validation(self):
        """Test password validation during registration"""
        try:
            # Test with weak password
            weak_password_data = {
                'email': f'weak.password.{uuid.uuid4().hex[:8]}@example.com',
                'password': '123',  # Too short
                'name': 'Weak Password User'
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=weak_password_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Password Validation", 
                    True, 
                    "Weak password correctly rejected"
                )
                return True
            else:
                self.log_test(
                    "Password Validation", 
                    False, 
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Password Validation", 
                False, 
                f"Exception: {str(e)}"
            )
            return False
    
    def test_duplicate_email_registration(self):
        """Test duplicate email registration prevention"""
        try:
            # Try to register with an existing email
            if 'user' not in self.test_users:
                self.log_test("Duplicate Email Registration", False, "No existing user to test with")
                return False
            
            duplicate_data = {
                'email': self.test_users['user']['email'],  # Use existing email
                'password': 'DifferentPassword123!',
                'name': 'Duplicate User'
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=duplicate_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 400:
                self.log_test(
                    "Duplicate Email Registration", 
                    True, 
                    "Duplicate email correctly rejected"
                )
                return True
            else:
                self.log_test(
                    "Duplicate Email Registration", 
                    False, 
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Duplicate Email Registration", 
                False, 
                f"Exception: {str(e)}"
            )
            return False
    
    def test_invalid_login_credentials(self):
        """Test invalid login credentials"""
        try:
            # Test with wrong password
            invalid_login_data = {
                'email': self.test_users['user']['email'],
                'password': 'WrongPassword123!'
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=invalid_login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 401:
                self.log_test(
                    "Invalid Login Credentials", 
                    True, 
                    "Invalid credentials correctly rejected"
                )
                return True
            else:
                self.log_test(
                    "Invalid Login Credentials", 
                    False, 
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Invalid Login Credentials", 
                False, 
                f"Exception: {str(e)}"
            )
            return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🚀 Starting Comprehensive Authentication Testing")
        print("=" * 60)
        
        test_methods = [
            self.test_root_endpoint,
            self.test_user_registration,
            self.test_user_login,
            self.test_auth_me_endpoint,
            self.test_referral_code_system,
            self.test_registration_with_coupon,
            self.test_role_based_access_control,
            self.test_invalid_token_handling,
            self.test_password_validation,
            self.test_duplicate_email_registration,
            self.test_invalid_login_credentials
        ]
        
        passed_tests = 0
        total_tests = len(test_methods)
        
        for test_method in test_methods:
            print(f"\n📋 Running {test_method.__name__}...")
            try:
                if test_method():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        
        if passed_tests == total_tests:
            print("🎉 ALL AUTHENTICATION TESTS PASSED!")
        else:
            print("⚠️  Some tests failed. Check the details above.")
        
        # Print detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = AuthenticationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)