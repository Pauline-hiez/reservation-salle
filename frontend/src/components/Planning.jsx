export default function Planning() {
    const moisNoms = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const aujourdHui = new Date();
    const annee = aujourdHui.getFullYear();
    const mois = aujourdHui.getMonth();
    const nbJours = new Date(annee, mois + 1, 0).getDate();

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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

    return (
        <div id="calendrier-container" className="w-full flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl">
                {/* Titre du mois */}
                <h2 className="text-3xl font-bold text-cyan-600 tracking-widest py-6">
                    {moisNoms[mois].toUpperCase()} {annee}
                </h2>

                {/* Calendrier */}
                <div id="calendrier" className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-7 border-l border-t border-gray-300">
                        {/* En-têtes des jours */}
                        {joursSemaine.map((jour, index) => (
                            <div
                                key={`semaine-${index}`}
                                className="bg-cyan-400 text-white font-semibold text-center py-3 border-r border-b border-gray-300"
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
                                        className="h-24 p-2 border-r border-b border-gray-300 bg-cyan-100 text-gray-400"
                                    >
                                        <span className="text-sm">{item.numero}</span>
                                    </div>
                                );
                            }

                            const cellClass = item.estPasse
                                ? "h-24 p-2 border-r border-b border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "h-24 p-2 border-r border-b border-gray-300 bg-white hover:bg-cyan-50 cursor-pointer transition-colors";

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
            </div>
        </div>
    );
}