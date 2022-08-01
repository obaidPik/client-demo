// db.collection("users").doc(doc.id).update({foo: "bar"});


import app from "../../firebase";
import { doc, getDoc,setDoc } from "firebase/firestore";
import { getFirestore } from 'firebase/firestore';

export default async function addBalance(req, res) {
    const { amount } = req.query;
    const db = getFirestore(app);
    // Create a reference to the card collection
    const docRef = doc(db, "credit-cards", "credit@111");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        await setDoc(doc(db, "credit-cards",  "credit@111"), {
            credit: parseInt(docSnap.data().credit)+parseInt(amount)
        });
        const docSnapNew = await getDoc(docRef);
        if (docSnapNew.exists()) { 
            res.status(200).send({ message: docSnapNew.data().credit });
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        res.status(500).send({ message: "No such document!" });

      }
}
