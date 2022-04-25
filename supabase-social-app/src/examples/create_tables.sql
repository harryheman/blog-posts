CREATE TABLE users (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL,
  first_name text,
  last_name text,
  age int,
  avatar_url text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  user_id text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  content text NOT NULL,
  user_id text NOT NULL,
  post_id int NOT NULL,
  created_at timestamp DEFAULT now()
);
