-- Update user passwords with correct bcrypt hash for "password123"
-- Run this in TablePlus

USE optimum_juridis;

-- First, check if users exist
SELECT id, email, name, role FROM User;

-- Update the password hash (this is the bcrypt hash for 'password123')
UPDATE User SET password = '$2b$10$t5QtHLdsfUKR0wLcSO4uXpveA8IuSmh3kVLPOZgQMmvqM9mBOKPnC' WHERE email = 'director@test.com';
UPDATE User SET password = '$2b$10$t5QtHLdsfUKR0wLcSO4uXpveA8IuSmh3kVLPOZgQMmvqM9mBOKPnC' WHERE email = 'consultant@test.com';

-- Verify the update
SELECT email, LEFT(password, 30) as password_preview FROM User;
