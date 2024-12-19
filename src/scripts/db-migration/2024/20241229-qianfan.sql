-- Update statements
UPDATE ModelReference
SET Name = 'ernie-4.0-turbo-8k'
WHERE Name = 'ERNIE-4.0-Turbo-8K';

UPDATE ModelReference
SET Name = 'completions_pro'
WHERE Name = 'ERNIE-4.0-8K';

UPDATE ModelReference
SET Name = 'completions'
WHERE Name = 'ERNIE-3.5-8K';

UPDATE ModelReference
SET Name = 'ernie-3.5-128k'
WHERE Name = 'ERNIE-3.5-128K';

UPDATE ModelReference
SET Name = 'ernie-speed-pro-128k'
WHERE Name = 'ERNIE-Speed-Pro-128K';

UPDATE ModelReference
SET Name = 'ernie-novel-8k'
WHERE Name = 'ERNIE-Novel-8K';

UPDATE ModelReference
SET Name = 'ernie-speed-128k'
WHERE Name = 'ERNIE-Speed-128K';

UPDATE ModelReference
SET Name = 'ernie_speed'
WHERE Name = 'ERNIE-Speed-8K';

UPDATE ModelReference
SET Name = 'ernie-lite-8k'
WHERE Name = 'ERNIE-Lite-8K';

UPDATE ModelReference
SET Name = 'ernie-tiny-128k'
WHERE Name = 'ERNIE-Tiny-128K';

UPDATE ModelReference
SET Name = 'ernie-tiny-8k'
WHERE Name = 'ERNIE-Tiny-8K';

UPDATE ModelReference
SET Name = 'ernie-char-fiction-8k'
WHERE Name = 'ERNIE-Character-Fiction-8K';

UPDATE ModelReference
SET Name = 'ernie-func-8k'
WHERE Name = 'ERNIE-Functions-8K';

UPDATE ModelReference
SET Name = 'ernie-lite-pro-128k'
WHERE Name = 'ERNIE-Lite-Pro-128K';

-- Delete statement
DELETE FROM ModelReference
WHERE Name = 'ERNIE-Lite-128K';