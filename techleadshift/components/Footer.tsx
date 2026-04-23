export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <span className="footer-brand">Tech Lead Shift</span>
        <span className="footer-copy">&copy; 2026 Charles Betancourt. All rights reserved.</span>
        <ul className="footer-links">
          <li>
            <a href="https://techleadshift.substack.com" target="_blank" rel="noopener noreferrer">
              Substack
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/charlesbetancourt" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
