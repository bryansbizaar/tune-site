import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { VITE_API_URL } from "../env.js";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/Button";
import AuthForm from "./AuthForm";
import { useAuth } from "../useAuth";

const Navigation = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav>
      <ul className="nav">
        <li className="nav-item">
          <Link to="/tunelist">Tunes</Link>
          <Link to="/chords">Chords</Link>
          <Link to="/resources">Resources</Link>
          {isLoggedIn ? (
            <Button onClick={handleLogout}>Log Out</Button>
          ) : (
            <Button onClick={handleLoginClick}>Log In</Button>
          )}
          <a
            href="https://www.facebook.com/groups/whangareifolkrootstraditionalmusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${VITE_API_URL}/images/facebook.png`}
              alt="facebook logo"
              width="17"
              height="17"
              style={{ marginLeft: "10px" }}
            />
          </a>
        </li>
      </ul>
      {!isLoggedIn && (
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content">
              <Dialog.Title className="dialog-title">
                Authentication
              </Dialog.Title>
              <Dialog.Description className="dialog-description">
                Log in or sign up to access exclusive content.
              </Dialog.Description>
              <AuthForm onClose={handleCloseModal} />
              <Dialog.Close asChild>
                <button className="dialog-close" aria-label="Close">
                  ×
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </nav>
  );
};

export default Navigation;
