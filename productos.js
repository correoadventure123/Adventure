/* Galería integrada: conserva las consultas y carruseles del sitio. */
document.querySelectorAll('[data-images]').forEach(controls=>{
 if(JSON.parse(controls.dataset.images).length===1)controls.querySelectorAll('button').forEach(button=>button.disabled=true);
});
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-photo]');if(!button)return;
 const controls=button.closest('[data-images]');const images=JSON.parse(controls.dataset.images);
 const index=((Number(controls.dataset.index)||0)+Number(button.dataset.photo)+images.length)%images.length;
 controls.dataset.index=index;const image=controls.closest('article').querySelector('.ad-product-photo img');
 image.src=images[index];controls.querySelector('span').textContent=`${index+1} / ${images.length}`;
});
