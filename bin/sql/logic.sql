CREATE TABLE logic (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  questions TEXT NOT NULL,
  responses TEXT[] NOT NULL
);

INSERT INTO logic (inputs, outputs)
VALUES
({"Hello", "Hi"}, {"Hi", "How are you?", "Good day"}),
({"How are you"} {"I'm fine", "Awesome", "Good, thank you"});
