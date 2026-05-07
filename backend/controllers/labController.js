const { db } = require('../config/firebase');

const getLab = async (req, res, next) => {
  try {
    const { labId } = req.params;
    const labRef = db.collection('labs').doc(labId);
    const doc = await labRef.get();

    if (!doc.exists || labId === 'ransomware') {
      if (labId === 'ddos') {
        const defaultData = {
          simulation: {
            baseTrafficRate: 1000,
            maxAttackTraffic: 50
          },
          explanation: `Think of a web server like a physical bank branch, and network requests as customers trying to enter. Normally, the bank handles a specific number of people at a time without breaking a sweat.

But in a DDoS attack, an attacker sends a massive "fake crowd" to flood the doors all at once. They aren't there to steal; they just want to block the entrance. The server gets completely overwhelmed, freezes, and crashes—locking out your real customers.

How to Stop It: The Firewall
To fix this, we can't just close the bank. Instead, we deploy a Firewall—which acts like highly trained security guards at the door. The firewall's job is to instantly filter, control, and block that unwanted fake traffic before it ever reaches the server. It tosses out the bad guys while letting your real customers walk right in, keeping your business online.`
        };
        await labRef.set(defaultData);
        return res.status(200).json(defaultData);
      } else if (labId === 'phishing') {
        const defaultData = {
          explanation: `What is a Phishing Website?\nImagine walking into a bank to deposit your paycheck. The lobby looks perfect, the tellers are smiling, and the logo is correct. But it's actually a fake movie set built by criminals. If you hand them your money, it's gone forever.\n\nIn the digital world, this is called Phishing. Attackers build counterfeit websites that look exactly like your real bank, email, or company login page.\n\nHow to Spot the Fake: Check the Street Sign\nCriminals can copy logos and colors easily, but they cannot steal the exact official Web Address (URL). The only way to know you are in the right place is to look at the 'street sign'—the address bar at the very top of your browser. If the address looks unusually long, contains strange words like 'update' or 'security-alert', or is missing the secure padlock, close the window immediately.`
        };
        await labRef.set(defaultData);
        return res.status(200).json(defaultData);
      } else if (labId === 'ransomware') {
        const defaultData = {
          explanation: `The Simple Explanation:
Imagine someone sneaks into your house, puts an unbreakable padlock on the cabinet where you keep all your family photos, tax documents, and important files, and then runs away with the key.

They leave a note on the cabinet saying, "Pay me ₹50,000 in untraceable cash by tomorrow, or I will throw the key in the river and you will never see your photos again."

In the digital world, this padlock is called "encryption." A hacker sneaks a virus onto your phone or computer, locks all your files so you can't open them, and demands payment (usually cryptocurrency) to give you the digital "key" to unlock them.

How you usually get tricked into it:

Fake Attachments: You get an email that looks like an urgent "Invoice" or "Delivery Receipt." When you download the PDF, it secretly installs the padlock virus.

"Free" Software: You try to download a cracked video game or free movie from a shady website, and the virus hitches a ride on the download.

🛡️ How to Defend Yourself (Prevention Strategies)
The best way to beat a hostage taker is to make sure what they stole isn't your only copy.

The "Spare Key" Rule (Backups): This is your ultimate shield. Keep a copy of your most important photos and documents on a separate USB drive or in the Cloud (like Google Drive). If a hacker locks your laptop, you won't care! You can just wipe the laptop clean and get your files back from the Cloud.

Don't Let Strangers In: Never download attachments or click links in emails if you weren't expecting them—even if it looks like it's from your bank or a delivery company. Call them directly to check.

Lock the Windows (Software Updates): Hackers use known "broken windows" in old phone and computer software to sneak the virus in. When your phone asks you to do a System Update, do it immediately. It patches those broken windows.`
        };
        await labRef.set(defaultData);
        return res.status(200).json(defaultData);
      }
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.status(200).json(doc.data());
  } catch (error) {
    next(error);
  }
};

module.exports = { getLab };
