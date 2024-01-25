-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY, 
    tenant_id UUID, 
    username VARCHAR(255) UNIQUE NOT NULL, 
    hashed_pwd TEXT NOT NULL, 
    nickname VARCHAR(100), 
    created_at TIMESTAMP WITH TIME ZONE
);

-- Friends Table
CREATE TABLE Friends (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    user_id UUID, 
    friend_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_friends_user_id ON Friends (user_id);
CREATE INDEX idx_friends_friend_id ON Friends (friend_id);

-- Subjects Table
CREATE TABLE Subjects (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    title TEXT,
    image_url TEXT,
    description TEXT, 
    created_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES Users(id)
);

CREATE INDEX idx_subjects_created_by ON Subjects (created_by);

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
