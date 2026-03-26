// Exemple d'utilisation dans un composant
const Component = () => {
  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      {/* Bouton principal */}
      <button className="bg-gray-900 dark:bg-gray-50 text-gray-50 dark:text-gray-900 
                       hover:bg-gray-700 dark:hover:bg-gray-200 
                       transition-colors duration-200">
        Bouton
      </button>
      
      {/* Carte avec bordure */}
      <div className="border border-light-border dark:border-dark-border 
                      bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <h2 className="text-light-text dark:text-dark-text">
          Titre
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Description
        </p>
      </div>
      
      {/* Input */}
      <input 
        className="border border-light-border dark:border-dark-border 
                   bg-light-bg dark:bg-dark-bg 
                   text-light-text dark:text-dark-text
                   focus:border-gray-400 dark:focus:border-gray-500"
      />
    </div>
  );
};