CREATE TABLE logic (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  questions TEXT[] NOT NULL,
  responses TEXT[] NOT NULL
);

INSERT INTO logic (inputs, outputs)
VALUES
({"hello", "hi"}, {"hi", "how are you?", "good day"}),
({"how are you"}, {"i'm fine", "awesome", "good, thank you"});
