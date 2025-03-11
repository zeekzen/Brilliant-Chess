import Legal from "@/components/svg/legal";

export default function Privacy() {
    return (
        <div className="flex-grow h-full">
            <header>
                <h1 className="text-4xl font-extrabold mx-auto mt-6 flex flex-row items-center gap-4 w-fit"><Legal draggable size={40} class="fill-foreground" />Privacy Policy</h1>
            </header>
            <main className="p-8 pt-14">
                <div className="bg-backgroundBox max-w-4xl rounded-borderRoundness m-auto p-8">
                    <p className="text-foregroundGrey">Last updated: 11/3/2025</p>

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">1. Information We Collect</h2>
                    <p>When you visit our website, we may collect the following information:</p>
                    <ul className="list-disc ml-5">
                        <li>Your IP address</li>
                        <li>Browser type and version</li>
                        <li>Pages visited and time spent on them</li>
                        <li>Referring website</li>
                    </ul>
                    <p>This data is collected through Ahrefs Web Analytics, Google AdSense, and our internal security systems.</p>

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">2. Use of Information</h2>
                    <p>We use the information collected to:</p>
                    <ul className="list-disc ml-5">
                        <li>Improve website performance and user experience</li>
                        <li>Analyze user behavior and traffic patterns</li>
                        <li>Prevent spam and unauthorized activities</li>
                        <li>Serve personalized ads through Google AdSense</li>
                    </ul>

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">3. Storage of IP Addresses</h2>
                    <p>To prevent spam, we store IP addresses of users who submit feedback on the <code className="bg-backgroundBoxDarker rounded-borderRoundness">/feedback</code> page. These IP addresses are used solely for security purposes and are not shared with third parties.</p>

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">4. Google Services</h2>

                    <h3 className="text-xl font-bold mt-2">Google AdSense</h3>
                    <p>We display ads using Google AdSense, which may collect user data to personalize ads.</p>

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">5. Cookies</h2>
                    <p>We use cookies to enhance your experience and analyze website traffic. You can disable cookies in your browser settings.</p>

                    {/* <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">6. User Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul className="list-disc ml-5">
                        <li>Request access to your personal data</li>
                        <li>Request deletion of your data</li>
                        <li>Opt out of personalized ads</li>
                    </ul>
                    <p>To make such requests, contact us at <a href="mailto:privacy@yourwebsite.com">privacy@yourwebsite.com</a>.</p> */}

                    {/* <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">7. Data Security</h2>
                    <p>We take reasonable measures to protect your data from unauthorized access, loss, or misuse. However, no system is completely secure.</p> */}

                    <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">8. Changes to This Privacy Policy</h2>
                    <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated date.</p>

                    {/* <h2 className="text-2xl text-foregroundHighlighted mt-5 mb-2 font-bold">9. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@yourwebsite.com">privacy@yourwebsite.com</a>.</p> */}
                </div>
            </main>
        </div>
    )
}