START TRANSACTION;

INSERT INTO `entitytype` (`id`, `description`)
    VALUES (1, 'user');

INSERT INTO `entitytype` (`id`, `description`)
    VALUES (2, 'wallet');

INSERT INTO `entitytype` (`id`, `description`)
    VALUES (3, 'card');

INSERT INTO `entitytype` (`id`, `description`)
    VALUES (4, 'bank');
    
COMMIT;