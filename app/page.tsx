"use client"; // Fixes React hooks issue
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Send, Menu } from "lucide-react";


import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

function UserProfile() {
  const { user, isLoading, logout } = useAuth0();
  const [open, setOpen] = useState(false);


  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Image
          src={user?.picture || "/default-avatar.png"}
          alt={user?.name || "User"}
          width={32}
          height={32}
          className="rounded-full cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent className="bg-white p-4 rounded-lg shadow-lg border border-gray-300 w-60">
        <p className="text-sm text-gray-700">Family ID: <span className="font-mono">{user?.session_id || "N/A"}</span></p>
        <p className="text-sm text-gray-700 mt-1">User ID: <span className="font-mono">{user?.sub}</span></p>
        <Button 
          className="mt-4 w-full bg-red-500 text-white p-2 rounded-lg"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function ProtectedChatApp() {

  const { isAuthenticated, loginWithRedirect, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState<string>("");
  const [malwareInput, setMalwareInput] = useState<string>("");

  // Extract the error_description from the URL manually
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorDesc = urlParams.get("error_description");
    if (errorDesc) {
      setErrorDescription(decodeURIComponent(errorDesc));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !errorDescription) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-100 text-black">Loading...</div>;
  }

  if (!isAuthenticated && errorDescription) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-black p-4">
        <div className="bg-red-500 text-white p-4 rounded-lg text-center">
          <h2 className="text-lg font-bold">Authentication Error</h2>
          <p>{decodeURIComponent(errorDescription)}</p>
          <button
            onClick={() => loginWithRedirect({authorizationParams : {retry: true}})}
            className="mt-4 bg-black text-white p-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // getAccessTokenSilently is now retrieved inside handleSend to avoid Hooks rule violations


  const handleSend = async () => {


    if (typeof window === 'undefined') return;
    try {


      const token = await getAccessTokenSilently({ cacheMode: 'off' });
      console.log("token", token)
      if (!token) {
        alert('Session expired. Please log in again.');
        loginWithRedirect();
        // logout();
        return;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
      // alert('Session expired. Please log in again.');
      // logout();
      loginWithRedirect();
      return;
    }

    if (!input.trim()) return;



    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  const handleRotateCookie = async () => {
    if (!user?.session_id) {
      alert("User session ID not found.");
      return;
    }

    try {
      const response = await fetch("/api/proxy-clear-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: user.session_id }),
      });

      // Log response status and full text
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      const responseData = await response.json();
      console.log("Response Body:", responseData);

      if (response.ok) {
        console.log("✅ Session ID cleared successfully.");
        loginWithRedirect();
      } else {
        console.error("❌ Failed to rotate cookie:", responseData);
        alert(`Failed to rotate cookie: ${responseData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error clearing session ID:", error);
      alert("An error occurred.");
    }
  };





  const handleSubmitMalware = async () => {
    if (!user?.session_id) {
      alert("User session ID not found.");
      return;
    }

    if (!malwareInput.trim()) {
      alert("Please enter some text before submitting!");
      return;
    }

    const dataToSubmit = {
      cookie: `${malwareInput}`,
      session_id: `${user.session_id}`
    };

    try {
      const response = await fetch("/api/proxy-store-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      console.log("Response", response.body);

      if (response.ok) {
        alert("Cookie + Session ID submitted successfully!");
        setMalwareInput(""); // Clear input field
      } else {
        alert("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("An error occurred while submitting.");
    }
  };





  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between h-full">
        <div>
          <img src='/auth0-logo.svg' alt='Auth0 Logo' className='w-24 h-auto' />
          <Button className="w-full mb-4">New Chat</Button>
          <ScrollArea className="flex-1 space-y-2 overflow-y-auto">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="p-2 cursor-pointer hover:bg-gray-700">Chat {i + 1}</Card>
            ))}
          </ScrollArea>
        </div>
        <div className="mt-4 flex flex-col">
          <Input
            className="p-2 border rounded-lg text-black"
            placeholder="Enter stolen cookie data..."
            value={malwareInput}
            onChange={(e) => setMalwareInput(e.target.value)}
          />

          <Button onClick={handleSubmitMalware} className="mt-2 bg-black text-white p-2 rounded-lg">
            Malware (Submit)
          </Button>
          <Button onClick={handleRotateCookie} className="mt-2 bg-black text-white p-2 rounded-lg">
            Force Cookie Rotation
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-screen bg-white rounded-lg shadow-lg mx-4 p-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <Menu className="md:hidden text-gray-700" size={24} />
          <h1 className="text-xl font-bold">Auth0AI</h1>
          {user?.cookies_warning && (
            <div className="ml-4 bg-yellow-200 text-yellow-900 px-4 py-2 rounded-lg shadow-md">
              ⚠️ {user.cookies_warning}
            </div>
          )}
          <UserProfile />
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} my-2`}
            >
              <Card className={`max-w-md p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                <CardContent>{msg.content}</CardContent>
              </Card>
            </div>
          ))}
        </ScrollArea>

        {/* Input Box */}
        <div className="flex items-center p-4 border-t border-gray-300 bg-white">
          <div className="flex w-full bg-gray-100 rounded-full p-2 items-center">
            <Input
              className="flex-1 bg-transparent border-none text-black px-4 py-2 focus:outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSend()}
            />
            <Button className="p-2 rounded-full bg-blue-500 text-white" onClick={handleSend}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth0AIClone() {
  return (
    <Auth0Provider
      domain="nelson.jp.auth0.com"
      clientId="bMxE4GZLuHZJWnEcTcooBJptPXgfC0hY"
      authorizationParams={{
        redirect_uri: typeof window !== "undefined" ? window.location.origin : ""
      }}
    >
      <ProtectedChatApp />
    </Auth0Provider>
  );
}
