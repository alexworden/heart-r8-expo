-- Drop All Tables so we can re-create them --
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Friends;
DROP TABLE IF EXISTS Subjects;
DROP TABLE IF EXISTS Ratings;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_friends_user_id;
DROP INDEX IF EXISTS idx_friends_friend_id;
DROP INDEX IF EXISTS idx_friends_tenant_id;
DROP INDEX IF EXISTS idx_subjects_created_by;
DROP INDEX IF EXISTS idx_subjects_tenant_id;
DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS idx_ratings_subject_id;
DROP INDEX IF EXISTS idx_ratings_tenant_id;
  

-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY, 
    tenant_id TEXT, 
    username VARCHAR(255) NOT NULL,
    hashed_pwd TEXT NOT NULL, 
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_address VARCHAR(255) NOT NULL, 
    nickname VARCHAR(100), 
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_username ON Users (username);
CREATE INDEX idx_users_tenant_id ON Users (tenant_id); 

-- Friends Table
CREATE TABLE Friends (
    id UUID PRIMARY KEY,
    tenant_id TEXT,
    user_id UUID, 
    friend_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_friends_user_id ON Friends (user_id);
CREATE INDEX idx_friends_friend_id ON Friends (friend_id);
CREATE INDEX idx_friends_tenant_id ON Friends (tenant_id);

-- Subjects Table
CREATE TABLE Subjects (
    id UUID PRIMARY KEY,
    tenant_id TEXT,
    title TEXT,
    image_url TEXT,
    description TEXT, 
    created_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

CREATE INDEX idx_subjects_created_by ON Subjects (created_by);
CREATE INDEX idx_subjects_tenant_id ON Subjects (tenant_id);

-- Ratings Table
CREATE TABLE Ratings (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    user_id UUID,
    subject_id UUID,
    rating_value INTEGER,
    dont_care BOOLEAN,
    dont_know BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    comment TEXT
);

CREATE INDEX idx_ratings_user_id ON Ratings (user_id);
CREATE INDEX idx_ratings_subject_id ON Ratings (subject_id);
CREATE INDEX idx_ratings_tenant_id ON Ratings (tenant_id);

