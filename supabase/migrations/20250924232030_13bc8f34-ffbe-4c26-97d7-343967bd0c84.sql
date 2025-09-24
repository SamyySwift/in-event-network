-- Generate access key for existing host users who don't have one
UPDATE profiles 
SET access_key = generate_unique_host_access_key()
WHERE role = 'host' 
AND access_key IS NULL;