import React, { useState } from "react";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";
import AuthForm from "./AuthForm";
import { useAuth } from "../useAuth";

const AuthButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

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
