import React, { useCallback, useEffect, useState } from "react";
import classes from "./search.module.css";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import {
  FaSearch,
  FaExclamationCircle,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import Star from "../Assets/star.svg";
import Repo from "../Assets/repo.svg";
import Code from "../Assets/code.svg";

const API_URL = "https://api.github.com/search/repositories";

const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow placement="top" classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    maxWidth: "50rem",
    fontSize: theme.typography.pxToRem(14),
  },
}));

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState("");
  const [sortOption, setSortOption] = useState("stars");
  const [isFetching, setIsFetching] = useState(false);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [repos, setRepos] = useState([]);
  const [perPage, setPerPage] = useState(30);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState("desc");
  const [hovered, setHovered] = useState(Array(repos.length).fill(false));

  const handleSearch = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `${API_URL}?q=${searchTerm}&sort=${sortOption}&order=${sortType}&per_page=${perPage}&page=${page}`
      );
      const data = await response.json();
      setRepos(data?.items);
      setIsFetching(false);
      setSearched(true);
      setSearchedTerm(searchTerm);
      setTotalPage(Math.ceil(data?.total_count / perPage));
      setTotalSearchResults(data?.total_count);
    } catch (err) {
      console.log(err);
      setIsFetching(false);
    }
  }, [searchTerm, sortOption, sortType, perPage, page]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
      setPage(1);
    }
  }, [sortOption, perPage, sortType]);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [page]);

  const handleButtonClick = (e, pageDir) => {
    e.preventDefault();
    if (pageDir === "next") {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
  };

  const handlePageSelect = (e, val) => {
    e.preventDefault();
    setPage(val);
  };

  const handleSort = (event) => {
    setSortOption(event.target.value);
  };

  function handlePerPageChange(event) {
    setPerPage(parseInt(event.target.value));
    setPage(1);
  }

  const handleMouseEnter = (index) => {
    const newHovered = [...hovered];
    newHovered[index] = true;
    setHovered(newHovered);
  }
  
  const handleMouseLeave =(index) => {
    const newHovered = [...hovered];
    newHovered[index] = false;
    setHovered(newHovered);
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Search the Git</h1>
      <div className={classes.mainContent}>
        <div className={classes.searchBar}>
          <input
            type="text"
            value={searchTerm}
            className={classes.searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={handleSearch}
            className={`${classes.searchButton} ${
              searchTerm === "" && classes.disabled
            }`}
            disabled={searchTerm ? false : true}
          >
            Search
          </button>
          <select
            value={sortOption}
            className={classes.sortSelect}
            onChange={handleSort}
            disabled={searchTerm ? false : true}
          >
            <option value="stars">Stars</option>
            <option value="watchers">Watchers</option>
            <option value="score">Score</option>
            <option value="name">Name</option>
            <option value="created">Created at</option>
            <option value="updated">Updated at</option>
          </select>
          <select
            value={sortType}
            className={classes.sortSelect}
            onChange={(e) => setSortType(e.target.value)}
            disabled={searchTerm ? false : true}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
          <select
            value={perPage}
            className={classes.perPage}
            onChange={handlePerPageChange}
            disabled={searchTerm ? false : true}
          >
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="90">90</option>
          </select>
        </div>
        {isFetching ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <div className={`${classes["linkingBg"]}`}>
              <CircularProgress
                style={{ color: "white", backgroundColor: "transparent" }}
                size={50}
              />
            </div>
          </div>
        ) : (
          <>
            {searched && searchedTerm !== "" ? (
              <>
                {page === 1 && (
                  <p className={classes.countRepo}>
                    Total {totalSearchResults} results were found
                  </p>
                )}
                {repos?.length > 0 ? (
                  <>
                    <div className={classes.cardList}>
                      {repos.map((repo, index) => (
                        <a href={repo?.html_url} rel="noreferrer" target="_blank">
                          <div
                            key={repo.id}
                            className={classes.card}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                          >
                            <BootstrapTooltip title={repo?.owner?.login}>
                              <img
                                src={repo?.owner?.avatar_url}
                                alt="avatar"
                                className={classes.avatar}
                              />
                            </BootstrapTooltip>

                            <div className={classes.details}>
                              <div className={classes.headDesc}>
                                <div className={classes.together}>
                                  <img
                                    className={classes.headerIcon}
                                    src={Repo}
                                    alt="Repository Icon"
                                  />
                                  <BootstrapTooltip title={repo?.name}>
                                    <h2 className={classes.name}>
                                      {repo?.name}
                                    </h2>
                                  </BootstrapTooltip>
                                </div>
                                <br />
                                <p
                                  className={`${classes.description} ${
                                    classes.ellipsis
                                  } ${
                                    hovered[index] && classes.descriptionHover
                                  }`}
                                >
                                  <strong>Description:</strong>{" "}
                                  {repo?.description
                                    ? repo?.description
                                    : "N/A"}
                                </p>
                              </div>
                              <br />
                              <div className={classes.sameLine}>
                                <div className={classes.together}>
                                  <img
                                    className={classes.icons}
                                    src={Star}
                                    alt="Stars"
                                  />
                                  <span className={classes.stars}>
                                    {repo?.stargazers_count}
                                  </span>
                                </div>
                                <div className={classes.together}>
                                  <img
                                    className={classes.icons}
                                    src={Code}
                                    alt="Coding Language"
                                  />
                                  <span className={classes.language}>
                                    {repo?.language ? repo?.language : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className={classes.paginationFooter}>
                      <button
                        className={`${classes.nextButton} ${
                          (page <= 1 || totalPage === 1) && classes.disabled
                        }`}
                        onClick={(e) => {
                          handleButtonClick(e, "prev");
                        }}
                      >
                        <FaArrowLeft /> Prev Page
                      </button>

                      {page - 2 > 0 && (
                        <button
                          className={classes.pageButton}
                          onClick={(e) => {
                            handlePageSelect(e, page - 2);
                          }}
                        >
                          {page - 2}
                        </button>
                      )}
                      {page - 1 > 0 && (
                        <button
                          className={classes.pageButton}
                          onClick={(e) => {
                            handlePageSelect(e, page - 1);
                          }}
                        >
                          {page - 1}
                        </button>
                      )}
                      <button
                        className={classes.pageButtonSelected}
                        onClick={(e) => {
                          handlePageSelect(e, page);
                        }}
                      >
                        {page}
                      </button>
                      {totalPage >= page + 1 && (
                        <button
                          className={classes.pageButton}
                          onClick={(e) => {
                            handlePageSelect(e, page + 1);
                          }}
                        >
                          {page + 1}
                        </button>
                      )}
                      {totalPage >= page + 2 && (
                        <button
                          className={classes.pageButton}
                          onClick={(e) => {
                            handlePageSelect(e, page + 2);
                          }}
                        >
                          {page + 2}
                        </button>
                      )}

                      <button
                        className={`${classes.nextButton} ${
                          (totalPage === 1 || totalPage === page) && classes.disabled
                        }`}
                        onClick={(e) => {
                          handleButtonClick(e, "next");
                        }}
                      >
                        Next Page <FaArrowRight />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={classes.noDataAvailable}>
                    <FaExclamationCircle />
                    <p>
                      We couldn’t find any repositories matching `{searchedTerm}
                      `
                    </p>
                  </div>
                )}{" "}
              </>
            ) : (
              <div className={classes.noDataAvailable}>
                <FaSearch />
                <p>Try searching for a term.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
