import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";
import AuthForm from "./AuthForm";
import { useAuth } from "../useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const AuthButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("reset_token");
    if (token) {
      setIsModalOpen(true);
    }
  }, [location]);

  const handleLoginClick = (e) => {
    e.preventDefault();
    // If we're on a reset_token URL, navigate away first
    const query = new URLSearchParams(location.search);
    if (query.get("reset_token")) {
      navigate("/", { replace: true });
      // Short delay to ensure navigation completes before opening modal
      setTimeout(() => setIsModalOpen(true), 100);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // If we're on a reset_token URL and closing the modal, navigate away
    const query = new URLSearchParams(location.search);
    if (query.get("reset_token")) {
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <Button onClick={handleLogout}>Log Out</Button>
      ) : (
        <Button onClick={handleLoginClick}>Log In</Button>
      )}
      {!isLoggedIn && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogTitle>Authentication</DialogTitle>
            <DialogDescription>
              Please log in or sign up to access your account.
            </DialogDescription>
            <AuthForm onClose={handleCloseModal} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AuthButton;
