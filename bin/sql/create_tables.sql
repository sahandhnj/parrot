CREATE TABLE audiolog (
  id            BIGSERIAL PRIMARY KEY NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  time_stamp    TIMESTAMP WITH TIME ZONE,
  audio_content TEXT NOT NULL
);

CREATE TABLE logic (
  id            BIGSERIAL PRIMARY KEY,
  questions     TEXT[],
  answers       TEXT[]
);

INSERT INTO logic (questions, answers)
VALUES
('{"Hi", "Hello"}', '{"Fine", "Great", "Awesome"}'),
('{"How are you"}', '{"Im fine", "Awesome", "Good, thank you"}');
