import{I as h,r as J,b as N,E as n,a as c,d as i,e as u,f as S,h as g,k as D,p as m,s as V,l as E,J as O,_ as j,n as B}from"./index.js";import{h as T,i as d}from"./db.js";const f=o=>h.load(o),p=o=>h.dump(o),b={style:{height:"80vh"}},M={__name:"index",setup(o){const e=J({code:p(T()),language:"yaml"}),_=()=>{let a=!1;if(console.log(e.language),e.language==="json"?a=d(e.code):a=d(JSON.stringify(f(e.code))),!a){n.error("yaml配置文件格式异常，请检查！！");return}t=!1,n.success("保存成功")};N(()=>{t&&n("当前插件配置未保存，请手动保存！")});let t=!1;const y=a=>{e.code=a,t=!0},l=c(!0),v=a=>{console.log(a,e),a?(e.code=p(JSON.parse(e.code)),e.language="yaml"):(e.code=JSON.stringify(f(e.code),null,2),e.language="json"),C()},s=c(!0),C=()=>{s.value=!1,setTimeout(()=>{s.value=!0},100)};return(a,r)=>{const k=i("el-button"),w=i("el-switch");return u(),S("div",b,[g(k,{onClick:_,style:{margin:"5px"},type:"primary"},{default:D(()=>[m(" 保存配置 ")]),_:1}),g(w,{modelValue:l.value,"onUpdate:modelValue":r[0]||(r[0]=x=>l.value=x),size:"large","active-text":"YAML","inactive-text":"JSON",onChange:v},null,8,["modelValue"]),m(" "+V(a.code)+" ",1),s.value?(u(),E(j,O({key:0},e,{onChangeData:y}),null,16)):B("",!0)])}}};export{M as default};
