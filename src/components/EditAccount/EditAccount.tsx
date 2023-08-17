/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    getAuth,
    signOut,
    updateProfile,
    // updateEmail,
    onAuthStateChanged,
    verifyBeforeUpdateEmail,
} from "firebase/auth";
// import { ref, getStorage } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import Styles from "./EditAccount.module.css";
import { FormEvent, useRef, useState, useEffect } from "react";
import AtomicSpinner from "atomic-spinner";
import ShowError from "../Error";
import { produce } from "immer";
import LoadingStyles from "../SignIn/SignIn.module.css";
import { RxExit } from "react-icons/rx";
import LinkGoogle from "./LinkGoogle";
import LinkGithub from "./LinkGithub";
import LinkTwitter from "./LinkTwitter";
import LinkFacebook from "./LinkFacebook";
import DeleteAccount from "./DeleteAccount";

export default function EditAccount() {
    const [reRender, triggerReRender] = useState(0);
    const defaultDpUrl =
        "https://s3.ap-southeast-1.amazonaws.com/cdn.ahnafwafiq.com/user.jpg";
    // console.log(auth.currentUser?.providerData);
    // console.log(auth.currentUser?.providerId);
    const [isLoading, setLoading] = useState(false);
    const [ErrorObj, setErrorObj] = useState({
        error: false,
        code: "",
        message: "",
        unchangedMessage: "",
    });
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [providers, setProviders] = useState({
        password: false,
        google: false,
        facebook: false,
        twitter: false,
        github: false,
    });
    // Getting provider info
    useEffect(() => {
        onAuthStateChanged(auth, (newUser) => {
            if (newUser) {
                newUser.providerData.forEach((provider) => {
                    if (provider.providerId === "password") {
                        setProviders((prev) => {
                            return { ...prev, password: true };
                        });
                    } else if (provider.providerId === "google.com") {
                        setProviders((prev) => {
                            return { ...prev, google: true };
                        });
                    } else if (provider.providerId === "facebook.com") {
                        setProviders((prev) => {
                            return { ...prev, facebook: true };
                        });
                    } else if (provider.providerId === "github.com") {
                        setProviders((prev) => {
                            return { ...prev, github: true };
                        });
                    } else if (provider.providerId === "twitter.com") {
                        setProviders((prev) => {
                            return { ...prev, twitter: true };
                        });
                    }
                });
            }
        });
    }, [reRender]);

    const displayNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    return (
        <>
            <dialog open className={Styles.editAccount}>
                <img
                    className={Styles.displayPicture}
                    src={user?.photoURL || defaultDpUrl}
                    alt="User Profile Picture"
                />
                <h2>Hello, {user?.displayName}</h2>
                <h4>Edit Account Details:</h4>
                <div className={Styles.editingDiv}>
                    <form
                        onSubmit={async (e: FormEvent) => {
                            e.preventDefault();
                            setLoading(true);
                            const newDisplayName =
                                displayNameRef.current?.value;
                            if (newDisplayName && auth.currentUser) {
                                try {
                                    await updateProfile(auth.currentUser, {
                                        displayName: newDisplayName,
                                    });
                                    setLoading(false);
                                } catch (e: any) {
                                    setLoading(false);
                                    setErrorObj(
                                        produce((draft) => {
                                            draft.error = true;
                                            draft.message = e.message;
                                            draft.code = e.code;
                                        }),
                                    );
                                }
                            }
                        }}
                    >
                        <label htmlFor="displayname">Display Name: </label>
                        <input
                            ref={displayNameRef}
                            type="text"
                            id="displayname"
                            name="displayname"
                            placeholder={user?.displayName || ""}
                            required
                        />
                        <button type="submit">Save</button>
                    </form>
                    <form
                        onSubmit={async (e: FormEvent) => {
                            e.preventDefault();
                            setLoading(true);
                            const newEmail = emailRef.current?.value;
                            if (newEmail && auth.currentUser) {
                                try {
                                    await verifyBeforeUpdateEmail(
                                        auth.currentUser,
                                        newEmail,
                                    );
                                    setLoading(false);
                                } catch (e: any) {
                                    setLoading(false);
                                    setErrorObj(
                                        produce((draft) => {
                                            draft.error = true;
                                            draft.message = e.message;
                                            draft.code = e.code;
                                        }),
                                    );
                                }
                            }
                        }}
                    >
                        <label htmlFor="email">Email: </label>
                        <input
                            ref={emailRef}
                            type="text"
                            id="email"
                            name="email"
                            placeholder={user?.email || ""}
                            required
                        />
                        <button type="submit">Save</button>
                    </form>
                </div>
                <h4>Connect other login-in methods:</h4>
                <div className={Styles.connectionDiv}>
                    <table>
                        <LinkGoogle
                            connected={providers.google}
                            startLoading={() => setLoading(true)}
                            stopLoading={() => setLoading(false)}
                            setError={setErrorObj}
                            reRender={() => triggerReRender(reRender + 1)}
                        />
                        <LinkGithub
                            connected={providers.github}
                            startLoading={() => setLoading(true)}
                            stopLoading={() => setLoading(false)}
                            setError={setErrorObj}
                            reRender={() => triggerReRender(reRender + 1)}
                        />
                        <LinkFacebook
                            connected={providers.facebook}
                            startLoading={() => setLoading(true)}
                            stopLoading={() => setLoading(false)}
                            setError={setErrorObj}
                            reRender={() => triggerReRender(reRender + 1)}
                        />
                        <LinkTwitter
                            connected={providers.twitter}
                            startLoading={() => setLoading(true)}
                            stopLoading={() => setLoading(false)}
                            setError={setErrorObj}
                            reRender={() => triggerReRender(reRender + 1)}
                        />
                    </table>
                </div>
                <DeleteAccount
                    startLoading={() => setLoading(true)}
                    stopLoading={() => setLoading(false)}
                    setError={setErrorObj}
                />
                <button
                    onClick={async () => {
                        setLoading(true);
                        await signOut(auth);
                        setLoading(false);
                    }}
                    className={Styles.signOutBtn}
                >
                    <RxExit />
                    <span> </span>
                    Sign Out
                </button>
                <Loading show={isLoading} />
            </dialog>
            {ErrorObj.error ? (
                <ShowError
                    code={ErrorObj.code || ""}
                    onClose={() =>
                        setErrorObj({
                            error: false,
                            code: "",
                            message: "",
                            unchangedMessage: "",
                        })
                    }
                    unchangedMessage={ErrorObj.unchangedMessage}
                >
                    {ErrorObj.message}
                </ShowError>
            ) : null}
        </>
    );
}

interface LoadingProps {
    show: boolean;
}

function Loading({ show }: LoadingProps) {
    if (!show) return null;
    return (
        <>
            <div className={LoadingStyles.loadingDiv}>
                <AtomicSpinner
                    electronColorPalette={["#c6c1b7", "#ada9a0", "#949189"]}
                    electronPathColor="#4c4b16"
                    atomSize={350}
                    nucleusParticleFillColor="#f7f1e5"
                    nucleusParticleBorderColor="#4c4b16"
                />
            </div>
        </>
    );
}
