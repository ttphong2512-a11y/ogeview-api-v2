import fs from "fs";

async function get(url){
  const res = await fetch(url);

  if(!res.ok){
    throw new Error("API error " + res.status);
  }

  return await res.json();
}


// Lấy danh sách anime
const season = await get(
  "https://api.jikan.moe/v4/seasons/now?limit=20"
);

const top = await get(
  "https://api.jikan.moe/v4/top/anime?limit=10"
);

const popular = await get(
  "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=10"
);


// Gộp danh sách, bỏ trùng ID
const animeList = [
  ...season.data,
  ...top.data,
  ...popular.data
];

const ids = [...new Set(
  animeList.map(a => a.mal_id)
)];


console.log("Total anime:", ids.length);


// Tạo thư mục details
if(!fs.existsSync("details")){
  fs.mkdirSync("details");
}


// Lấy chi tiết từng anime
for(const id of ids){

  try{

    console.log("Loading:", id);

    const full = await get(
      `https://api.jikan.moe/v4/anime/${id}/full`
    );


    fs.writeFileSync(
      `details/${id}.json`,
      JSON.stringify(full.data, null, 2)
    );


    console.log("Saved:", id);


    // tránh bị giới hạn Jikan
    await new Promise(
      r=>setTimeout(r,1000)
    );


  }catch(e){

    console.log(
      "Skip:",
      id,
      e.message
    );

  }

}


console.log("DONE - Details updated");
