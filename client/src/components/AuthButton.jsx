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
import { useLocation } from "react-router-dom";

const AuthButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("reset_token");
    if (token) {
      setIsModalOpen(true);
    }
  }, [location]);

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
