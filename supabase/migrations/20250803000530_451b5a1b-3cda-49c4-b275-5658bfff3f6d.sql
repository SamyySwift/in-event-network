-- Update the recharge@gmail.com user to have host role
UPDATE profiles 
SET role = 'host', updated_at = now()
WHERE email = 'recharge@gmail.com';