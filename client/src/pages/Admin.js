import React from "react";
import { Button,Container } from "react-bootstrap";
import CreateType from "../components/modals/CreateType";
import { useState } from "react";

const Admin =()=> {
    const [typeVisible, setTypeVisible] = useState(false)
  return (
   <Container className="d-flex flex-column">
    <Button
                variant={"outline-dark"}
                className="mt-4 p-2"
                onClick={() => setTypeVisible(true)}
            >
                Добавить тип
            </Button>
          
         <CreateType show={typeVisible} onHide={() => setTypeVisible(false)}/>
       
   </Container>
  );
}

export default Admin;
