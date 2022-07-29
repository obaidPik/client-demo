import app from "../../firebase";
import { doc, getDoc,setDoc } from "firebase/firestore";
import { getFirestore } from 'firebase/firestore';

export default async function getCredit(req, res) {

    const db = getFirestore(app);
    // Create a reference to the card collection
    const docRef = doc(db, "credit-cards", "credit@111");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data().credit);
        res.status(200).send({ message: docSnap.data().credit });
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        res.status(500).send({ message: "No such document!" });

      }
}
