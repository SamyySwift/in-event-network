-- Update specific email accounts back to host/admin role
UPDATE public.profiles 
SET role = 'host' 
WHERE email IN (
  'Nlc25@gmail.com',
  'Wealth@gmail.com', 
  'gino@gmail.com',
  'Creative@gmail.com',
  'Recharge@gmail.com',
  'Mj@gmail.com'
);