/*
  # Initial Schema Setup for Service Marketplace

  1. New Tables
    - `profiles` - User profiles with authentication
    - `services` - Service listings (offers and requests)
    - `messages` - Communication between users
    - `transactions` - Payment records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  is_admin boolean DEFAULT false
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('offer', 'request')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  image_url text
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Services Policies
CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create services"
  ON services
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON services
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON services
  FOR DELETE
  USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent"
  ON messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Transactions Policies
CREATE POLICY "Users can view transactions they're involved in"
  ON transactions
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions as buyers"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Admin Policies (override other policies for admins)
CREATE POLICY "Admins can do everything with profiles"
  ON profiles
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything with services"
  ON services
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything with messages"
  ON messages
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything with transactions"
  ON transactions
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS services_user_id_idx ON services (user_id);
CREATE INDEX IF NOT EXISTS services_type_idx ON services (type);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages (sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS messages_service_id_idx ON messages (service_id);
CREATE INDEX IF NOT EXISTS transactions_service_id_idx ON transactions (service_id);
CREATE INDEX IF NOT EXISTS transactions_buyer_id_idx ON transactions (buyer_id);
CREATE INDEX IF NOT EXISTS transactions_seller_id_idx ON transactions (seller_id);