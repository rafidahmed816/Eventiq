// Debug script to test profile updates
const { createClient } = require('@supabase/supabase-js');

// Add your Supabase config here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileUpdate() {
  console.log('Testing profile update...');
  
  // First get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('User error:', userError);
    return;
  }
  
  if (!user) {
    console.error('No user found');
    return;
  }
  
  console.log('Current user:', user.id);
  
  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (profileError) {
    console.error('Profile error:', profileError);
    return;
  }
  
  console.log('Current profile:', profile);
  
  // Try simple update (just updated_at)
  console.log('Testing simple update...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', profile.id)
    .select()
    .single();
    
  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Update successful:', updateData);
  }
}

testProfileUpdate().catch(console.error);
