// Test script to verify tracking ID functionality
// Run this in the browser console to test the tracking ID system

console.log("🧪 Testing Tracking ID Functionality");

// Test 1: Generate tracking ID
function generateTrackingId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `TRK${dateStr}-${randomStr}`;
}

// Test 2: Validate tracking ID format
function isValidTrackingId(trackingId) {
  const pattern = /^TRK\d{8}-[A-Z0-9]{8}$/;
  return pattern.test(trackingId);
}

// Test 3: Test tracking ID generation
console.log("📋 Test 1: Generate Tracking ID");
const testId = generateTrackingId();
console.log("Generated ID:", testId);
console.log("Is valid:", isValidTrackingId(testId));

// Test 4: Test localStorage data structure
console.log("📋 Test 2: Check localStorage Data Structure");
const user = JSON.parse(localStorage.getItem("user") || "null");
if (user) {
  console.log("User found:", user.id);
  const submissions = JSON.parse(localStorage.getItem(`userSubmissions_${user.id}`) || "[]");
  console.log("Submissions found:", submissions.length);
  
  if (submissions.length > 0) {
    const firstSubmission = submissions[0];
    console.log("First submission structure:", {
      trackingId: firstSubmission.trackingId,
      tracking_id: firstSubmission.tracking_id,
      formTitle: firstSubmission.formTitle,
      formType: firstSubmission.formType,
      status: firstSubmission.status
    });
    
    // Test utility functions
    console.log("📋 Test 3: Test Utility Functions");
    const trackingId = firstSubmission.trackingId || firstSubmission.tracking_id;
    const formTitle = firstSubmission.formTitle || firstSubmission.form_id || 'Unknown Form';
    const formType = firstSubmission.formType || firstSubmission.form_id || 'Unknown';
    
    console.log("Extracted tracking ID:", trackingId);
    console.log("Extracted form title:", formTitle);
    console.log("Extracted form type:", formType);
  }
} else {
  console.log("No user found in localStorage");
}

// Test 5: Test search functionality
console.log("📋 Test 4: Test Search Functionality");
if (user) {
  const submissions = JSON.parse(localStorage.getItem(`userSubmissions_${user.id}`) || "[]");
  if (submissions.length > 0) {
    const firstSubmission = submissions[0];
    const searchTerm = (firstSubmission.trackingId || firstSubmission.tracking_id || "").substring(0, 10);
    
    const matches = submissions.filter(submission => {
      const trackingId = submission.trackingId || submission.tracking_id || '';
      const formTitle = submission.formTitle || submission.form_id || 'Unknown Form';
      return trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
             formTitle.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    console.log("Search term:", searchTerm);
    console.log("Matches found:", matches.length);
    console.log("Match details:", matches.map(m => ({
      trackingId: m.trackingId || m.tracking_id,
      formTitle: m.formTitle || m.form_id
    })));
  }
}

console.log("✅ Tracking ID functionality test completed!");
