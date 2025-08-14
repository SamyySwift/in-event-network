UPDATE ticket_types 
SET price = 10000000, 
    updated_at = now()
WHERE price = 3000000;