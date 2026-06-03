export default function Landing() {
    const imgs = [
        "https://picsum.photos/id/1/200/300",
        "https://picsum.photos/id/2/200/300",
        "https://picsum.photos/id/3/200/300"
    ];


    return (
        <div>
            <h1>Estoy en la landing!</h1>
            <p>Descripción de la página</p>
            {
                imgs.map(img => (
                    <img
                        src={img}
                        alt="Un perrito negro"
                    />
                ))
            }
        </div>
    );
}