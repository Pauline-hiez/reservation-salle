function Footer() {
    return (
        <footer className="bg-cyan-500 text-white shadow-[0_-4px_15px_rgba(22,78,99,0.5)]">
            <div className="container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo Section */}
                    <div className="flex flex-col items-start">
                        <img
                            src="/assets/img/techspace-logo.webp"
                            alt="Logo TechSpace"
                            className="w-70 brightness-0 invert"
                        />
                    </div>

                    {/* Browse Section */}
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Browse</h3>
                        <ul className="space-y-2">
                            <li><a href="/" className="hover:underline">Home</a></li>
                            <li><a href="/about" className="hover:underline">About Us</a></li>
                            <li><a href="/services" className="hover:underline">Services</a></li>
                            <li><a href="/faqs" className="hover:underline">FAQs</a></li>
                            <li><a href="/testimonials" className="hover:underline">Testimonials</a></li>
                            <li><a href="/contact" className="hover:underline">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact Us Section */}
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <p className="hover:underline cursor-pointer">+1 720-940-4008</p>
                            <p className="text-sm leading-relaxed">
                                2851 Parker Rd Suite 1-0972, Aurora<br />
                                CO 80014, USA
                            </p>
                            <p className="hover:underline cursor-pointer break-all">
                                emmanuel@techspacesolutionsllc.com
                            </p>
                        </div>
                    </div>

                    {/* Follow Us Section */}
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Follow US</h3>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/assets/icons/facebook.svg"
                                    alt="Facebook"
                                    className="w-8 h-8 brightness-0 invert"
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
                                    className="w-8 h-8 brightness-0 invert"
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
                                    className="w-8 h-8 brightness-0 invert"
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
                                    className="w-8 h-8 brightness-0 invert"
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
                                    className="w-8 h-8 brightness-0 invert"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/30 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="text-sm">Réservation de salle - © {new Date().getFullYear()} TechSpace Solutions</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
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