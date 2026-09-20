const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const ADMIN_KEY = 'CHANGE_THIS_ADMIN_KEY';

function ss(){ return SpreadsheetApp.openById(SPREADSHEET_ID); }

function setup(){
  const s=ss();
  const sheets={
    Players:['Timestamp','Name','Village','Phone','Payment','Auction Status','Team','Auction Price'],
    Teams:['Timestamp','Owner','Team','Phone','Payment','Status'],
    Points:['Team','P','W','L','Pts']
  };
  Object.keys(sheets).forEach(n=>{
    let sh=s.getSheetByName(n)||s.insertSheet(n);
    if(sh.getLastRow()===0) sh.appendRow(sheets[n]);
  });
  return 'Setup complete';
}

function doGet(e){
  const a=e.parameter.action||'public';
  if(a==='public'){
    const s=ss();
    const ar=readRows(s.getSheetByName('Players'));
    const pr=readRows(s.getSheetByName('Points'));
    return json({auction:ar.map(x=>({player:x[1],status:x[5]||'Available',team:x[6]||'—',price:x[7]||'—'})),
      points:pr.map(x=>({team:x[0],p:x[1]||0,w:x[2]||0,l:x[3]||0,pts:x[4]||0}))});
  }
  return json({ok:false,message:'Invalid request'});
}

function doPost(e){
  try{
    const d=JSON.parse(e.postData.contents||'{}');
    const s=ss();
    if(d.action==='player'){
      s.getSheetByName('Players').appendRow([new Date(),clean(d.name),clean(d.village),clean(d.phone),'Pending','Available','','']);
      return json({ok:true,message:'Player registration received. Please follow the organiser’s payment instructions for ₹10.'});
    }
    if(d.action==='team'){
      s.getSheetByName('Teams').appendRow([new Date(),clean(d.owner),clean(d.team),clean(d.phone),'Pending','Registered']);
      return json({ok:true,message:'Team registration received. Please follow the organiser’s payment instructions for ₹600.'});
    }
    return json({ok:false,message:'Invalid registration'});
  }catch(err){ return json({ok:false,message:'Server error'}); }
}
function readRows(sh){if(!sh||sh.getLastRow()<2)return [];return sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getValues();}
function clean(v){return String(v||'').trim().slice(0,100);}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
