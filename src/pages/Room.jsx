import React, { useEffect, useState } from "react";
import client, { COLLECTION_ID_MESSAGES, DATABASE_ID, databases } from "../appwriteConfig";
import { ID, Query, Role, Permission } from "appwrite";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";

const Room = () => {
    const { user } = useAuth()

    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState('');

    useEffect(() => {
        getMessages()

        const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`, response => {



            if (response.events.includes("databases.*.collections.*.documents.*.create")) {
                console.log('A MESSAGE WAS CREATED');
                setMessages(prevState => [response.payload, ...prevState])

            }
            if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
                console.log('A MESSAGE WAS DELETED!!!!');
                setMessages(prevState => messages.filter(message => message.$id !== response.payload.$id))
            }
        });

        return () => {
            unsubscribe()

        }

    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        let payload = {
            user_id: user.$id,
            username: user.name,
            body: messageBody
        }

        let permissions = [
            Permission.write(Role.user(user.$id))
        ]


        let response = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            ID.unique(),
            payload,
            permissions
        )

        // setMessages(prevState => [response, ...prevState])

        setMessageBody('')

    }



    const getMessages = async () => {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_MESSAGES,
            [
                Query.orderDesc('$createdAt'),
                Query.limit(20)
            ]
        );
        console.log('RESPONSE:', response);
        setMessages(response.documents)
    }

    const deleteMesage = async (message_id) => {
        databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, message_id)
        // setMessages(prevState => messages.filter(message => message.$id !== message_id))
    }

    return (
        <main className="container">
            <Header />

            <div className="room--container">

                <form onSubmit={handleSubmit} id="message--form">
                    <div>
                        <textarea
                            required
                            maxLength="1000"
                            placeholder="Say something...."
                            onChange={(e) => { setMessageBody(e.target.value) }}
                            value={messageBody}
                        ></textarea>
                    </div>
                    <div className="send-btn--wrapper">
                        <input className="btn btn--secondary" type="submit" value="Send" />
                    </div>
                </form>

                <div>
                    {messages.map(message => (
                        <div key={message.$id} className="message--wrapper">

                            <div className="message--header">
                                <p>
                                    {message.username ? (
                                        <span>{message.username}</span>
                                    ) : (
                                        <span>Anonymous user</span>
                                    )}

                                    <small className="message-timestamp">{new Date(message.$createdAt).toLocaleString()}</small>
                                </p>

                                {/*  {message.$permission.includes(`delete(\"user:${user.$id}\")`)} */}
                                <button onClick={() => { deleteMesage(message.$id) }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 256 256" style={{ fill: '#FFFFFF' }}>
                                        <g fill="#ffffff" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
                                            <g transform="scale(8.53333,8.53333)">
                                                <path d="M13,3c-0.26757,-0.00363 -0.52543,0.10012 -0.71593,0.28805c-0.1905,0.18793 -0.29774,0.44436 -0.29774,0.71195h-5.98633c-0.36064,-0.0051 -0.69608,0.18438 -0.87789,0.49587c-0.18181,0.3115 -0.18181,0.69676 0,1.00825c0.18181,0.3115 0.51725,0.50097 0.87789,0.49587h18c0.36064,0.0051 0.69608,-0.18438 0.87789,-0.49587c0.18181,-0.3115 0.18181,-0.69676 0,-1.00825c-0.18181,-0.3115 -0.51725,-0.50097 -0.87789,-0.49587h-5.98633c0,-0.26759 -0.10724,-0.52403 -0.29774,-0.71195c-0.1905,-0.18793 -0.44836,-0.29168 -0.71593,-0.28805zM6,8v16c0,1.105 0.895,2 2,2h14c1.105,0 2,-0.895 2,-2v-16z" />
                                            </g>
                                        </g>
                                    </svg>

                                </button>
                            </div>


                            <div className="message--body">
                                <span>{message.body}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



        </main>
    )
}

export default Room