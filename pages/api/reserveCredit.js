import app from "../../firebase";
import { doc, getDoc,setDoc } from "firebase/firestore";
import { getFirestore } from 'firebase/firestore';

export default async function reserveCredit(req, res) {
  const { amount } = req.query;
  if (!amount) {
    res.status(405).send({ message: 'must send amount to reserve credit' });
    return;
  }
    const db = getFirestore(app);
    // Create a reference to the card collection
    const docRef = doc(db, "credit-cards", "credit@111");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data().credit);
        if (docSnap.data().credit - amount >= 0) {
            await setDoc(docRef, {
                credit: docSnap.data().credit - amount
            })
            res.status(200).send({ message: 'success' });
        }
        else {
            res.status(200).send({ message: 'failed' });
        }
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        res.status(500).send({ message: "No such document!" });

      }
}
