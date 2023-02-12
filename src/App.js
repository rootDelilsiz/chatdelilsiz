/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import avatarPic from './Images/avatar.svg';

const firebaseConfig = {
  apiKey: "AIzaSyBMTncDbGGxP6Gh462c9NQf79VRQR1Ir9w",
  authDomain: "chatlogin-84056.firebaseapp.com",
  databaseURL: "https://chatlogin-84056-default-rtdb.firebaseio.com",
  projectId: "chatlogin-84056",
  storageBucket: "chatlogin-84056.appspot.com",
  messagingSenderId: "1030996241137",
  appId: "1:1030996241137:web:442a053fdb39056db51750",
  measurementId: "G-D4ZC77WQCS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="appTitle"> Chat 💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Google ile katıl
      </button>
      <p className="text homepageText">
        Chate gel!
      </p>
      <p className="cometLogo">☄️</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Çık
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const recentMessagesQuery = query(
    collection(getFirestore(), 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const [messages] = useCollectionData(recentMessagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(getFirestore(), 'messages'), {
      name: getAuth().currentUser.displayName,
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

        <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type message"
        />

        <button type="submit" disabled={!formValue}>
          ☄️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, name } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || avatarPic} alt="" />
        <p className="text messageBubble">
          <b className="nameTag">{`${name} diyorki:`}</b>
          <br /> {text}
        </p>
      </div>
    </div>
  );
}

export default App;
