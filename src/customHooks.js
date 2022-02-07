import { useEffect, useCallback, useRef } from 'react';

// make API calls and pass the returned data via dispatch
export const useFetch = (pagedata,sahil, dispatch) => {
  useEffect(() => {
    dispatch({ type: 'FETCHING_IMAGES', fetching: true })
    var url;
  url=`http://localhost:8080${sahil}`;
  if(sahil===""){
    url=`http://localhost:8080/api/users/1/friendlist?limit=10`;}
  console.log("sahil",sahil);
  console.log("url",url);
  console.log("pagedata",pagedata);
    // fetch(`https://picsum.photos/v2/list?page=${pagedata.page}&limit=10`)
    fetch(url)
      .then(res => res.json())
      .then(images => {
        const {data,next_cursor_url}=images;
        console.log(data);
        // let resnext_cursor_url=next_cursor_url
        dispatch({ type: 'STACK_IMAGES', data })

        dispatch({ type: 'NEXT_CURSOR_URL', next_cursor_url })
        dispatch({ type: 'FETCHING_IMAGES', fetching: false })
        if(pagedata.page > 0){
          let pagnum=[];
          pagnum.push(data);
          dispatch({ type: 'PAGE_WISE_DATA',pagnum })}
      })
      .catch(e => {
        // handle error
        dispatch({ type: 'FETCHING_IMAGES', fetching: false })
        return e;
      })
  }, [dispatch, pagedata.page])
}

// infinite scrolling with intersection observer
export const useInfiniteScroll = (scrollRef, dispatch) => {
  const scrollObserver = useCallback(
    node => {
      new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.intersectionRatio > 0) {
            dispatch({ type: 'ADVANCE_PAGE' });
          }
        });
      }).observe(node);
    },
    [dispatch]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollObserver(scrollRef.current);
    }
  }, [scrollObserver, scrollRef]);
}

// lazy load images with intersection observer
export const useLazyLoading = (imgSelector, items) => {
  const imgObserver = useCallback(node => {
    const intObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.intersectionRatio > 0) {
          const currentImg = en.target;
          const newImgSrc = currentImg.dataset.src;

          // only swap out the image source if the new url exists
          if (!newImgSrc) {
            console.error('Image source is invalid');
          } else {
            currentImg.src = newImgSrc;
          }
          intObs.unobserve(node);
        }
      });
    })
    intObs.observe(node);
  }, []);

  const imagesRef = useRef(null);

  useEffect(() => {
    imagesRef.current = document.querySelectorAll(imgSelector);

    if (imagesRef.current) {
      imagesRef.current.forEach(img => imgObserver(img));
    }
  }, [imgObserver, imagesRef, imgSelector, items])
}
