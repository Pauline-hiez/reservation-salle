import { useState, useEffect } from 'react';

export default Home;

function Home() {
    const images = [
        "/public/assets/img/home1.png",
        "/public/assets/img/home2.png"
    ];

    const salleImages = [
        "/public/assets/img/salle1.png",
        "/public/assets/img/salle2.jpeg",
        "/public/assets/img/salle3.png"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSalleIndex, setCurrentSalleIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change d'image toutes les 3 secondes

        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSalleIndex((prevIndex) => (prevIndex + 1) % salleImages.length);
        }, 3000); // Change d'image toutes les 3 secondes

        return () => clearInterval(interval);
    }, [salleImages.length]);

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-8">
                <img src="/public/assets/img/techspace-logo.webp" alt="Logo TechSpace" className="w-100 h-auto mx-auto mb-8" />
            </div>

            <div className="flex flex-col gap-16 md:gap-24 mb-16 md:mb-24">
                {/* Section 1 */}
                <div className="relative w-full bg-cyan-500 text-white py-16 md:py-20 mb-20">
                    <div className="container mx-auto px-4 pr-72 md:pr-130">
                        <h2 className="text-3xl md:text-2xl">TechSpace Solutions est un espace de coworking qui accueille une cinquantaine de
                            collaborateurs répartis en plusieurs équipes. Nous disposons d'une salle de réunion partagée
                            (capacité 12 personnes) qui est actuellement source de nombreux conflits.</h2>
                    </div>
                    <div className="absolute top-1/2 right-4 md:right-16 transform -translate-y-1/2 w-72 md:w-96 aspect-square overflow-hidden rounded-xl shadow-2xl">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Accueil ${index + 1}`}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Section 2 */}
                <div className="relative w-full bg-cyan-500 text-white py-16 md:py-20 mb-20">
                    <div className="container mx-auto px-4 pl-72 md:pl-125 flex justify-end">
                        <h2 className="text-3xl md:text-2xl">Pour optimisez votre espace de travail, nous mettons à votre disposition une salle de réunion d'une capacité de 12 personnes. Créez votre compte, connectez-vous et réservez ! Retrouvez toutes vos réservations sur votre page profil, modifiez-les ou annulez-les.</h2>
                    </div>
                    <div className="absolute top-1/2 left-4 md:left-16 transform -translate-y-1/2 w-72 md:w-96 aspect-square overflow-hidden rounded-xl shadow-2xl">
                        {salleImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Salle ${index + 1}`}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSalleIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}