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
            {/* Logo TechSpace */}
            <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
                <img
                    src="/public/assets/img/techspace-logo.webp"
                    alt="Logo TechSpace"
                    className="w-64 sm:w-80 md:w-100 h-auto mx-auto"
                />
            </div>

            <div className="flex flex-col gap-12 md:gap-16 lg:gap-24 xl:gap-32 mb-8 md:mb-16 lg:mb-24">
                {/* Section 1 - Image à droite sur desktop, en haut sur mobile */}
                <div className="bg-[radial-gradient(circle,rgba(34,211,238,0.94)_0%,rgba(22,78,99,1)_100%)] text-white py-8 md:py-12 lg:py-2 xl:py-2">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12">
                            {/* Texte */}
                            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                                <h2 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl leading-relaxed">
                                    TechSpace Solutions est un espace de coworking qui accueille une cinquantaine de
                                    collaborateurs répartis en plusieurs équipes. Nous disposons d'une salle de réunion partagée
                                    (capacité 12 personnes) qui est actuellement source de nombreux conflits.
                                </h2>
                            </div>

                            {/* Image carousel */}
                            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md flex-shrink-0 order-1 lg:order-2 lg:-my-8 xl:-my-10">
                                <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-2xl">
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
                        </div>
                    </div>
                </div>

                {/* Section 2 - Image à gauche sur desktop, en haut sur mobile */}
                <div className="bg-[radial-gradient(circle,rgba(34,211,238,0.94)_0%,rgba(22,78,99,1)_100%)] text-white py-8 md:py-12 lg:py-2 xl:py-2">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12">
                            {/* Image carousel */}
                            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-md flex-shrink-0 order-1 lg:-my-8 xl:-my-10">
                                <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-2xl">
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

                            {/* Texte */}
                            <div className="flex-1 text-center lg:text-left order-2">
                                <h2 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl leading-relaxed">
                                    Pour optimisez votre espace de travail, nous mettons à votre disposition une salle de réunion
                                    d'une capacité de 12 personnes. Créez votre compte, connectez-vous et réservez ! Retrouvez
                                    toutes vos réservations sur votre page profil, modifiez-les ou annulez-les.
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}