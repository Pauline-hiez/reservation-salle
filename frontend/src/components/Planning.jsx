import { useState } from 'react';

export default function Planning() {
    const moisNoms = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const moisNomsAbr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const aujourdHui = new Date();
    const [vue, setVue] = useState('mois'); // 'jour', 'semaine', 'mois', 'annee'
    const [annee, setAnnee] = useState(aujourdHui.getFullYear());
    const [mois, setMois] = useState(aujourdHui.getMonth());
    const [jour, setJour] = useState(aujourdHui.getDate());
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const joursSemaineAbr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Choix d'affichage par jour, semaine, mois ou année
    const precedent = () => {
        if (vue === 'jour') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() - 1);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'semaine') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() - 7);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'mois') {
            if (mois === 0) {
                setMois(11);
                setAnnee(annee - 1);
            } else {
                setMois(mois - 1);
            }
        } else if (vue === 'annee') {
            setAnnee(annee - 1);
        }
    };

    const suivant = () => {
        if (vue === 'jour') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() + 1);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'semaine') {
            const dateActuelle = new Date(annee, mois, jour);
            dateActuelle.setDate(dateActuelle.getDate() + 7);
            setJour(dateActuelle.getDate());
            setMois(dateActuelle.getMonth());
            setAnnee(dateActuelle.getFullYear());
        } else if (vue === 'mois') {
            if (mois === 11) {
                setMois(0);
                setAnnee(annee + 1);
            } else {
                setMois(mois + 1);
            }
        } else if (vue === 'annee') {
            setAnnee(annee + 1);
        }
    };

    // Obtenir le titre selon la vue
    const getTitre = () => {
        if (vue === 'jour') {
            return `${jour} ${moisNoms[mois]} ${annee}`;
        } else if (vue === 'semaine') {
            const dateDebut = getDebutSemaine();
            const dateFin = new Date(dateDebut);
            dateFin.setDate(dateFin.getDate() + 6);
            return `Semaine du ${dateDebut.getDate()} ${moisNomsAbr[dateDebut.getMonth()]} au ${dateFin.getDate()} ${moisNomsAbr[dateFin.getMonth()]} ${annee}`;
        } else if (vue === 'mois') {
            return `${moisNoms[mois]} ${annee}`;
        } else {
            return `${annee}`;
        }
    };

    // Obtenir le début de la semaine (lundi)
    const getDebutSemaine = () => {
        const date = new Date(annee, mois, jour);
        const jourSemaine = date.getDay();
        const diff = jourSemaine === 0 ? -6 : 1 - jourSemaine;
        const lundi = new Date(date);
        lundi.setDate(date.getDate() + diff);
        return lundi;
    };

    // Obtenir les jours de la semaine
    const getJoursSemaine = () => {
        const debut = getDebutSemaine();
        const jours = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(debut);
            date.setDate(debut.getDate() + i);
            jours.push(date);
        }
        return jours;
    };

    // Premier jour du mois (0=dimanche, 1=lundi...)
    const premierJour = new Date(annee, mois, 1).getDay();
    const decalage = premierJour === 0 ? 6 : premierJour - 1;

    // Calculer les jours du mois précédent à afficher
    const joursMoisPrecedent = new Date(annee, mois, 0).getDate();
    const jours = [];

    // Ajouter les jours du mois précédent
    for (let i = decalage - 1; i >= 0; i--) {
        const jourPrecedent = joursMoisPrecedent - i;
        jours.push({
            type: 'autre-mois',
            numero: jourPrecedent,
            key: `prev-${jourPrecedent}`
        });
    }

    // Ajouter tous les jours du mois actuel
    for (let jour = 1; jour <= nbJours; jour++) {
        const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
        const dateJour = new Date(dateStr + "T00:00:00");
        const estPasse = dateJour < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());

        jours.push({
            type: 'jour-actuel',
            numero: jour,
            date: dateStr,
            estPasse,
            key: `jour-${jour}`
        });
    }

    // Compléter avec les jours du mois suivant pour remplir la grille
    const joursRestants = 42 - jours.length; // 6 semaines * 7 jours
    for (let i = 1; i <= joursRestants; i++) {
        jours.push({
            type: 'autre-mois',
            numero: i,
            key: `next-${i}`
        });
    }

    // Rendu de la vue jour
    const renderVueJour = () => {
        const dateActuelle = new Date(annee, mois, jour);
        const estPasse = dateActuelle < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
        const horaires = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h

        return (
            <div className="bg-white rounded-lg shadow-xl/30 overflow-hidden">
                <div className="p-6">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-cyan-600">
                            {joursSemaine[dateActuelle.getDay() === 0 ? 6 : dateActuelle.getDay() - 1]}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {horaires.map((heure) => (
                            <div
                                key={`horaire-${heure}`}
                                className={`p-4 border border-cyan-200 rounded ${estPasse ? 'bg-cyan-50 cursor-not-allowed' : 'bg-white hover:bg-cyan-50 cursor-pointer'
                                    } transition-colors`}
                            >
                                <span className="font-semibold text-cyan-700">{heure}h00 - {heure + 1}h00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Rendu de la vue semaine
    const renderVueSemaine = () => {
        const joursSemaineVue = getJoursSemaine();
        const horaires = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h

        return (
            <div className="bg-white rounded-lg shadow-xl/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block">
                        <div className="grid grid-cols-8 border-l border-t border-cyan-800">
                            {/* En-tête vide pour la colonne des horaires */}
                            <div className="bg-cyan-400 text-white font-semibold text-center py-3 border-r border-b border-cyan-800">
                                Heure
                            </div>
                            {/* En-têtes des jours */}
                            {joursSemaineVue.map((date, index) => {
                                const estPasse = date < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
                                return (
                                    <div
                                        key={`jour-${index}`}
                                        className={`${estPasse ? 'bg-cyan-300' : 'bg-cyan-400'
                                            } text-white font-semibold text-center py-3 border-r border-b border-cyan-800`}
                                    >
                                        <div>{joursSemaineAbr[index]}</div>
                                        <div className="text-sm">{date.getDate()}/{date.getMonth() + 1}</div>
                                    </div>
                                );
                            })}

                            {/* Lignes des horaires */}
                            {horaires.map((heure) => (
                                <div key={`horaire-row-${heure}`} className="contents">
                                    <div className="bg-cyan-50 text-cyan-700 font-medium text-center py-4 border-r border-b border-cyan-800">
                                        {heure}h
                                    </div>
                                    {joursSemaineVue.map((date, index) => {
                                        const estPasse = date < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
                                        return (
                                            <div
                                                key={`cell-${heure}-${index}`}
                                                className={`${estPasse
                                                    ? 'bg-cyan-100 cursor-not-allowed'
                                                    : 'bg-white hover:bg-cyan-50 cursor-pointer'
                                                    } border-r border-b border-cyan-800 h-16 transition-colors`}
                                            ></div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Rendu de la vue mois (existante)
    const renderVueMois = () => {
        return (
            <div id="calendrier" className="bg-white rounded-lg shadow-xl/30 overflow-hidden text-cyan-600">
                <div className="grid grid-cols-7 border-l border-t border-cyan-800 ">
                    {/* En-têtes des jours */}
                    {joursSemaine.map((jour, index) => (
                        <div
                            key={`semaine-${index}`}
                            className="bg-cyan-400 text-white font-semibold text-center py-3 border-r border-b border-cyan-800"
                        >
                            {jour}
                        </div>
                    ))}

                    {/* Cellules des jours */}
                    {jours.map((item) => {
                        if (item.type === 'autre-mois') {
                            return (
                                <div
                                    key={item.key}
                                    className="h-24 p-2 border-r border-b border-cyan-800 bg-cyan-100 text-cyan-600"
                                >
                                    <span className="text-sm">{item.numero}</span>
                                </div>
                            );
                        }

                        const cellClass = item.estPasse
                            ? "h-24 p-2 border-r border-b border-cyan-800 bg-cyan-100 text-cyan-600 cursor-not-allowed"
                            : "h-24 p-2 border-r border-b border-cyan-800 bg-white hover:bg-cyan-50 cursor-pointer transition-colors";

                        return (
                            <div
                                key={item.key}
                                className={cellClass}
                            >
                                <span className="text-sm font-medium">{item.numero}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Rendu de la vue année
    const renderVueAnnee = () => {
        const moisAnnee = Array.from({ length: 12 }, (_, i) => i);

        return (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {moisAnnee.map((moisIndex) => {
                    const nbJoursMois = new Date(annee, moisIndex + 1, 0).getDate();
                    const premierJourMois = new Date(annee, moisIndex, 1).getDay();
                    const decalageMois = premierJourMois === 0 ? 6 : premierJourMois - 1;

                    return (
                        <div
                            key={`mois-${moisIndex}`}
                            className="bg-white rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => {
                                setMois(moisIndex);
                                setVue('mois');
                            }}
                        >
                            <h3 className="text-center font-semibold text-cyan-600 mb-2">
                                {moisNoms[moisIndex]}
                            </h3>
                            <div className="grid grid-cols-7 gap-1 text-xs">
                                {joursSemaineAbr.map((jour, index) => (
                                    <div key={`jour-${index}`} className="text-center text-cyan-500 font-medium">
                                        {jour.charAt(0)}
                                    </div>
                                ))}
                                {Array.from({ length: decalageMois }).map((_, i) => (
                                    <div key={`empty-${i}`} className="text-center"></div>
                                ))}
                                {Array.from({ length: nbJoursMois }, (_, i) => i + 1).map((jourNum) => {
                                    const dateActuelle = new Date(annee, moisIndex, jourNum);
                                    const estAujourdHui =
                                        jourNum === aujourdHui.getDate() &&
                                        moisIndex === aujourdHui.getMonth() &&
                                        annee === aujourdHui.getFullYear();
                                    const estPasse = dateActuelle < new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());

                                    return (
                                        <div
                                            key={`jour-${jourNum}`}
                                            className={`text-center p-1 rounded ${estAujourdHui
                                                ? 'bg-cyan-500 text-white font-bold'
                                                : estPasse
                                                    ? 'text-cyan-300'
                                                    : 'text-cyan-600'
                                                }`}
                                        >
                                            {jourNum}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div id="calendrier-container" className="w-full flex flex-col items-center justify-center px-4 py-8">
            <div className={`w-full ${vue === 'annee' ? 'max-w-6xl' : 'max-w-4xl'}`}>
                {/* Sélecteur de vue */}
                <div className="flex justify-center gap-2 mb-6">
                    <button
                        onClick={() => setVue('jour')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'jour'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Jour
                    </button>
                    <button
                        onClick={() => setVue('semaine')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'semaine'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Semaine
                    </button>
                    <button
                        onClick={() => setVue('mois')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'mois'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Mois
                    </button>
                    <button
                        onClick={() => setVue('annee')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${vue === 'annee'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-cyan-600 border-2 border-cyan-500 hover:bg-cyan-50'
                            }`}
                    >
                        Année
                    </button>
                </div>

                {/* Navigation et titre */}
                <div className="flex items-center justify-between py-6">
                    <button
                        onClick={precedent}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                        Précédent
                    </button>
                    <h2 className="text-3xl font-bold text-cyan-600 text-shadow-lg tracking-widest text-center">
                        {getTitre().toUpperCase()}
                    </h2>
                    <button
                        onClick={suivant}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md cursor-pointer"
                    >
                        Suivant
                    </button>
                </div>

                {/* Affichage de la vue sélectionnée */}
                {vue === 'jour' && renderVueJour()}
                {vue === 'semaine' && renderVueSemaine()}
                {vue === 'mois' && renderVueMois()}
                {vue === 'annee' && renderVueAnnee()}
            </div>
        </div>
    );
}