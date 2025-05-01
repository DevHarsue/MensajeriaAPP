CREATE OR REPLACE FUNCTION delete_code()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM codes WHERE email=old.email;
    DELETE FROM codes WHERE email=new.email;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_delete_code
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_code();


CREATE OR REPLACE FUNCTION create_chat(VARIADIC users_id INTEGER[])
RETURNS INTEGER
LANGUAGE 'plpgsql'
AS $$
DECLARE
	chat_id_var INT;
	num_id INT;
BEGIN
	INSERT INTO chats default values
	RETURNING chat_id INTO chat_id_var;

	IF array_length(users_id, 1) < 2 THEN
        RAISE EXCEPTION 'There are not enough ids';
    END IF;

	INSERT INTO participants (chat_id, user_id)
    SELECT chat_id_var, unnest(users_id); 
	
	RETURN chat_id_var;
END;
$$;
