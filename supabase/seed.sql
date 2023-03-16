select * from auth.users;

insert into
    auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at
    )
values
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa00',
        'mark@pekala.com',
        '$2a$10$DFbvnrXWfmB8PgzonRl3eu0i3nxXjRrVPWtt5Yl0uqmTf7zLQ7eZq',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa02',
        'chris@wirth.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa03',
        'siri@prasad.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa04',
        'david@hacker.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa05',
        'michael@frim.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa06',
        'raj@mittal.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa07',
        'troy@powell.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    ),
    (
        '6148d9ae-9687-4434-804d-a3c4d370fa08',
        'vassilios@kaxiras.com',
        '$2a$10$5ijpbk9hVmO5Luy/vTObj.3dZS1XQKGzzWTsiixha.xD3wmqKJ1ZS',
        '2023-02-17 04:32:46.892482+00'
    );

insert into puzzles
    (live_date, difficulty, theme, puzzle, solution)
values
    (
        '2023-02-15',
        'daily',
        'test',
        '{"clues":[[{"type":"fillable","downClue":"The answer is 36","acrossClue":"The answer is 36","clueNumber":1},{"type":"fillable","downClue":"The answer is 64","clueNumber":2}],[{"type":"fillable","acrossClue":"The answer is 64","clueNumber":3},{"type":"fillable","clueNumber":null}]],"shape":[2,2]}',
        '{"shape":[2,2],"answers":[[3,6],[6,4]]}'
    ),
    (
        '2023-03-17',
        'daily',
        'test',
        '{"shape": [3,2], "clues": [[{"type": "fillable", "clueNumber": 1, "acrossClue": "The smallest two digits in this puzzle", "downClue": "The 3 digits are the first three multiples of an integer, in order"}, {"type": "fillable", "clueNumber": 2, "downClue": "A power of 4"}], [{"type": "fillable", "clueNumber": 3, "acrossClue": "Age when you become a senior, according to Medicare"}, {"type": "fillable", "clueNumber": null}], [{"type": "fillable", "clueNumber": 4, "acrossClue": "When subtracted by its reverse, yields 27"}, {"type": "fillable", "clueNumber": null}]]}',
        '{"shape": [3,2], "answers": [[3,2],[6,5],[9,6]]}'
    );