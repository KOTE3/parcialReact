import { Button, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function ProfileCard({ name, description, likes }) {
    console.log("Componente pintandose!");
    const [likesCounter, setLikesCounter] = useState(0);
    // let likesCounter = likes;

    const increaseLikes = () => {
        console.log("He dado like!");
        setLikesCounter(0);
        setLikesCounter(1);
        setLikesCounter(2);
        console.log(likesCounter);
    };

    useEffect(() => {
        console.log("Likes cambiaron! Useffect");
    }, [likesCounter]);

    return (
        <Card
            style={{
                padding: 10,
                width: "300px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: 10
            }}
            elevation={20}
        >
            <Typography style={{ fontWeight: "bold" }}>{name}</Typography>
            <Typography>{description}</Typography>
            <Typography>Likes: {likesCounter ?? 0}</Typography>
            <Button
                variant="contained"
                onClick={increaseLikes}
            >
                Likes!
            </Button>
        </Card>
    );
}