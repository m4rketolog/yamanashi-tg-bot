

function filterInputData(data) {
    const lines = data.trim().split('\n').filter(line => line.trim() !== '');
  
    const res = lines.map(line => {
      const [prefix, login, password, email, emailPassword] = line.split(':');
  
      return {
          login,
          password,
          email,
          emailPassword
      };
    });
    return res;
}

const data = `
KZ:@yzaurelie:#t86081AdezY_:unwinyankep@outlook.com:uCN39P0n2HrZlo
KZ:@taanq_ga5192c:1994MYBofamYZy#:izamadonii@outlook.com:WYAgeTgkQTFX

KZ:@westgolden7:Zizaqa3824c!:saisaketlin@outlook.com:Wgrab2cP5qbvlf
KZ:@otsukate2719:Jenesac382@:pacielloedts@outlook.com:m5WgapY8SSvhXE
`;

console.log(filterInputData(data));