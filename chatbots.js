const Chatbot = {
  defaultResponses: {
    'hello': `Halo! Ada yang bisa saya bantu?`,
    'hi': `Halo! Ada yang bisa saya bantu?`,
    'halo': `Halo! Ada yang bisa saya bantu?`,
    'hai': `Halo! Ada yang bisa saya bantu?`,
    'how are you apa kabar': `Saya baik! Ada yang bisa saya bantu?`,
    'flip a coin lempar koin': function () {
      const randomNumber = Math.random();
      if (randomNumber < 0.5) {
        return 'Oke! Hasilnya gambar (heads)';
      } else {
        return 'Oke! Hasilnya angka (tails)';
      }
    },
    'roll a dice lempar dadu': function() {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Oke! Kamu mendapatkan angka ${diceResult}`;
    },
    'what is the date today tanggal hari ini': function () {
      const now = new Date();
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const month = months[now.getMonth()];
      const day = now.getDate();

      return `Hari ini tanggal ${day} ${month}`;
    },
    'thank terima kasih makasih': 'Sama-sama! Kalau butuh bantuan lagi, bilang saja ya!',
  },

  additionalResponses: {},

  unsuccessfulResponse: `Maaf, saya belum mengerti maksud kamu. Saat ini saya hanya bisa:
- Lempar koin
- Lempar dadu
- Menampilkan tanggal hari ini

Coba tanyakan salah satu ya 🙂`,

  emptyMessageResponse: `Pesan kamu kosong. Silakan ketik sesuatu ya 🙂`,

  addResponses: function (additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  getResponse: function (message) {
    if (!message) {
      return this.emptyMessageResponse;
    }

    message = message.toLowerCase(); // 🔥 penting untuk bahasa Indonesia juga

    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };

    const {
      ratings,
      bestMatchIndex,
    } = this.stringSimilarity(message, Object.keys(responses));

    const bestResponseRating = ratings[bestMatchIndex].rating;
    if (bestResponseRating <= 0.3) {
      return this.unsuccessfulResponse;
    }

    const bestResponseKey = ratings[bestMatchIndex].target;
    const response = responses[bestResponseKey];

    if (typeof response === 'function') {
      return response();
    } else {
      return response;
    }
  },

  getResponseAsync: function (message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getResponse(message));
      }, 1000);
    });
  },

  compareTwoStrings: function (first, second) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram) + 1
        : 1;

      firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram)
        ? firstBigrams.get(bigram)
        : 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  },

  stringSimilarity: function (mainString, targetStrings) {
    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = this.compareTwoStrings(mainString, currentTargetString)
      ratings.push({target: currentTargetString, rating: currentRating})
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i
      }
    }

    const bestMatch = ratings[bestMatchIndex]

    return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
  },
};