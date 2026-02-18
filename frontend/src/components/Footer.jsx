function Footer() {
    return (
        <footer className="bg-cyan-800 text-white shadow-[0_-4px_15px_rgba(22,78,99,0.5)]">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center sm:items-start">
                        <img
                            src="/assets/img/techspace-logo.webp"
                            alt="Logo TechSpace"
                            className="w-48 sm:w-56 md:w-70 brightness-0 invert"
                        />
                    </div>

                    {/* Contact Us Section */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Contact Us</h3>
                        <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                            <p className="hover:underline cursor-pointer">+1 720-940-4008</p>
                            <p className="text-xs md:text-sm leading-relaxed">
                                2851 Parker Rd Suite 1-0972, Aurora<br />
                                CO 80014, USA
                            </p>
                            <p className="hover:underline cursor-pointer break-all text-xs md:text-sm">
                                emmanuel@techspacesolutionsllc.com
                            </p>
                        </div>
                    </div>

                    {/* Follow Us Section */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Follow Us</h3>
                        <div className="flex gap-3 md:gap-4 justify-center sm:justify-start">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/facebook.svg"
                                    alt="Facebook"
                                    className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/twitter.svg"
                                    alt="Twitter"
                                    className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/instagram.svg"
                                    alt="Instagram"
                                    className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/youtube.svg"
                                    alt="YouTube"
                                    className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
                                />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/linkedin.svg"
                                    alt="LinkedIn"
                                    className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/30 mt-6 md:mt-8 pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
                    <p className="text-center md:text-left mb-3 md:mb-0">Réservation de salle - © {new Date().getFullYear()} TechSpace Solutions</p>
                    <div className="flex gap-3 md:gap-4">
                        <a href="/privacy" className="hover:underline">Privacy Policy</a>
                        <span>|</span>
                        <a href="/terms" className="hover:underline">Terms of Services</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;